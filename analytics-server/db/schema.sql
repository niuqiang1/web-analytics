-- Analytics Events Table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  distinct_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  app_id TEXT,
  timestamp INTEGER NOT NULL,
  url TEXT,
  referrer TEXT,
  properties TEXT, -- JSON string of all properties
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_distinct_id ON events(distinct_id);
CREATE INDEX IF NOT EXISTS idx_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_event_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_timestamp ON events(timestamp);

-- Users Table (aggregated)
CREATE TABLE IF NOT EXISTS users (
  distinct_id TEXT PRIMARY KEY,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  total_events INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0
);

-- Sessions Table (aggregated)
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  distinct_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  event_count INTEGER DEFAULT 0,
  FOREIGN KEY (distinct_id) REFERENCES users(distinct_id)
);
