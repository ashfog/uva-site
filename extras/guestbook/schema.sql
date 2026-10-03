CREATE TABLE IF NOT EXISTS notes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, body TEXT NOT NULL, color TEXT DEFAULT 'violet',
  ip TEXT, hidden INTEGER DEFAULT 0, created TEXT DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_notes_ip ON notes(ip,created);
