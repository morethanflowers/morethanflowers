import type { Metadata } from 'next';

import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { getDatabase } from '@/db';

import styles from './analytics.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Private visit log',
  robots: { index: false, follow: false, nocache: true },
};

type SummaryRow = {
  total_views: number;
  unique_visitors: number;
  views_24h: number;
};

type VisitRow = {
  id: number;
  visited_at: number;
  city: string | null;
  region: string | null;
  country: string | null;
  device: string;
  browser: string;
  source: string;
  path: string;
  referrer: string | null;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Chicago',
});

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

function formatLocation(visit: VisitRow): string {
  let country = visit.country;
  if (country) {
    try {
      country = countryNames.of(country) || country;
    } catch {
      // Cloudflare may use a non-geographic location code in rare cases.
    }
  }
  return [visit.city, visit.region, country].filter(Boolean).join(', ') || 'Location unavailable';
}

function Gate({ wrongAccount = false }: { wrongAccount?: boolean }) {
  return (
    <main className={styles.shell}>
      <section className={styles.gate}>
        <span className={styles.eyebrow}>More Than Flowers</span>
        <h1>Private visit log</h1>
        <p>
          {wrongAccount
            ? 'This dashboard belongs to a different account.'
            : 'Sign in with your ChatGPT account to view the private visitor summary.'}
        </p>
        <a href={chatGPTSignInPath('/analytics')} target="_top">
          {wrongAccount ? 'Switch account' : 'Sign in with ChatGPT'}
        </a>
      </section>
    </main>
  );
}

export default async function AnalyticsPage() {
  const user = await getChatGPTUser();
  const ownerEmail = process.env.ANALYTICS_OWNER_EMAIL?.trim().toLowerCase();

  if (!user) return <Gate />;
  if (!ownerEmail || user.email.toLowerCase() !== ownerEmail) return <Gate wrongAccount />;

  const database = getDatabase();
  const retentionCutoff = `(CAST(strftime('%s', 'now') AS INTEGER) * 1000 - 7776000000)`;

  await database.prepare(`DELETE FROM visits WHERE visited_at < ${retentionCutoff}`).run();

  const summary = await database
    .prepare(`
      SELECT
        COUNT(*) AS total_views,
        COUNT(DISTINCT visitor_hash) AS unique_visitors,
        SUM(
          CASE
            WHEN visited_at >= (CAST(strftime('%s', 'now') AS INTEGER) * 1000 - 86400000)
            THEN 1 ELSE 0
          END
        ) AS views_24h
      FROM visits
      WHERE visited_at >= ${retentionCutoff}
    `)
    .first<SummaryRow>();

  const result = await database
    .prepare(`
      SELECT id, visited_at, city, region, country, device, browser, source, path, referrer
      FROM visits
      WHERE visited_at >= ${retentionCutoff}
      ORDER BY visited_at DESC
      LIMIT 100
    `)
    .all<VisitRow>();

  const visits = result.results || [];
  const totals = summary || { total_views: 0, unique_visitors: 0, views_24h: 0 };

  return (
    <main className={styles.shell}>
      <section className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Owner dashboard</span>
            <h1>Private visit log</h1>
            <p>Approximate location only. This private log does not save IP addresses.</p>
          </div>
          <nav aria-label="Dashboard actions">
            <a href="/analytics">Refresh</a>
            <a href={chatGPTSignOutPath('/analytics')} target="_top">Sign out</a>
          </nav>
        </header>

        <div className={styles.summary}>
          <article><span>Total visits</span><strong>{totals.total_views}</strong></article>
          <article><span>Unique browsers</span><strong>{totals.unique_visitors}</strong></article>
          <article><span>Past 24 hours</span><strong>{totals.views_24h || 0}</strong></article>
        </div>

        <section className={styles.log} aria-labelledby="recent-visits">
          <div className={styles.logHeading}>
            <div>
              <span>Recent activity</span>
              <h2 id="recent-visits">Latest visits</h2>
            </div>
            <p>Times shown in Central Time · 90-day history</p>
          </div>

          {visits.length === 0 ? (
            <div className={styles.empty}>No visits have been recorded yet.</div>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr><th>When</th><th>Approximate location</th><th>Device</th><th>Opened from</th></tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.id}>
                      <td><time dateTime={new Date(visit.visited_at).toISOString()}>{dateFormatter.format(visit.visited_at)}</time></td>
                      <td>{formatLocation(visit)}</td>
                      <td>{visit.device}<small>{visit.browser}</small></td>
                      <td>{visit.source}<small>{visit.referrer ? `via ${visit.referrer}` : 'direct link'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
