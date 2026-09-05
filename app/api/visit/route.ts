import { getDatabase } from '@/db';

const allowedOrigins = new Set([
  'https://morethanflowers.github.io',
  'https://more-than-flowers.ogundejiadeola0.chatgpt.site',
]);

type VisitPayload = {
  visitorId?: string;
  sessionId?: string;
  path?: string;
  referrer?: string;
};

type CloudflareLocation = {
  city?: unknown;
  region?: unknown;
  country?: unknown;
};

function corsHeaders(origin: string): HeadersInit {
  return {
    ...(allowedOrigins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
}

function identifyDevice(userAgent: string): string {
  if (/iPad/i.test(userAgent)) return 'iPad';
  if (/iPhone/i.test(userAgent)) return 'iPhone';
  if (/Android/i.test(userAgent) && /Mobile/i.test(userAgent)) return 'Android phone';
  if (/Android/i.test(userAgent)) return 'Android tablet';
  if (/Mobile/i.test(userAgent)) return 'Mobile device';
  if (/Windows/i.test(userAgent)) return 'Windows computer';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac';
  if (/Linux/i.test(userAgent)) return 'Linux computer';
  return 'Unknown device';
}

function identifyBrowser(userAgent: string): string {
  if (/Edg\//i.test(userAgent)) return 'Edge';
  if (/CriOS\//i.test(userAgent)) return 'Chrome on iOS';
  if (/Chrome\//i.test(userAgent)) return 'Chrome';
  if (/FxiOS\//i.test(userAgent)) return 'Firefox on iOS';
  if (/Firefox\//i.test(userAgent)) return 'Firefox';
  if (/Safari\//i.test(userAgent) && /Version\//i.test(userAgent)) return 'Safari';
  return 'Other browser';
}

function referrerHost(value: unknown): string | null {
  const referrer = cleanText(value, 500);
  if (!referrer) return null;

  try {
    return new URL(referrer).hostname.slice(0, 160);
  } catch {
    return null;
  }
}

async function hashIdentifier(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '';
  return new Response(null, {
    status: allowedOrigins.has(origin) ? 204 : 403,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '';
  if (!allowedOrigins.has(origin)) {
    return new Response(null, { status: 403, headers: corsHeaders(origin) });
  }

  try {
    const declaredLength = Number(request.headers.get('content-length') || '0');
    if (declaredLength > 2048) {
      return new Response(null, { status: 413, headers: corsHeaders(origin) });
    }

    const rawBody = await request.text();
    if (rawBody.length > 2048) {
      return new Response(null, { status: 413, headers: corsHeaders(origin) });
    }

    const body = JSON.parse(rawBody) as VisitPayload;
    const visitorId = cleanText(body.visitorId, 100);
    const sessionId = cleanText(body.sessionId, 100);

    if (!visitorId || !sessionId || !/^[a-zA-Z0-9-]+$/.test(visitorId + sessionId)) {
      return new Response(null, { status: 400, headers: corsHeaders(origin) });
    }

    const location = (request as Request & { cf?: CloudflareLocation }).cf;
    const userAgent = request.headers.get('user-agent') || '';
    const database = getDatabase();
    const visitedAt = Date.now();

    const insert = database
      .prepare(`
        INSERT OR IGNORE INTO visits (
          session_hash, visitor_hash, visited_at, city, region, country,
          device, browser, source, path, referrer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        await hashIdentifier(sessionId),
        await hashIdentifier(visitorId),
        visitedAt,
        cleanText(location?.city, 120),
        cleanText(location?.region, 120),
        cleanText(location?.country, 2)?.toUpperCase() || request.headers.get('cf-ipcountry'),
        identifyDevice(userAgent),
        identifyBrowser(userAgent),
        origin === 'https://morethanflowers.github.io' ? 'GitHub Pages' : 'Backup site',
        cleanText(body.path, 200) || '/',
        referrerHost(body.referrer),
      );

    const removeExpired = database
      .prepare('DELETE FROM visits WHERE visited_at < ?')
      .bind(visitedAt - 90 * 24 * 60 * 60 * 1000);

    const keepDatabaseBounded = database.prepare(`
      DELETE FROM visits
      WHERE id NOT IN (
        SELECT id FROM visits ORDER BY visited_at DESC LIMIT 5000
      )
    `);

    await database.batch([insert, removeExpired, keepDatabaseBounded]);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  } catch {
    return new Response(null, { status: 500, headers: corsHeaders(origin) });
  }
}
