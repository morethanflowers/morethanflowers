import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const visits = sqliteTable(
  'visits',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionHash: text('session_hash').notNull(),
    visitorHash: text('visitor_hash').notNull(),
    visitedAt: integer('visited_at').notNull(),
    city: text('city'),
    region: text('region'),
    country: text('country'),
    device: text('device').notNull(),
    browser: text('browser').notNull(),
    source: text('source').notNull(),
    path: text('path').notNull(),
    referrer: text('referrer'),
  },
  (table) => [
    uniqueIndex('visits_session_hash_unique').on(table.sessionHash),
    index('idx_visits_visited_at').on(table.visitedAt),
    index('idx_visits_visitor_hash').on(table.visitorHash),
  ],
);
