-- Migration 0031: Support guest device FCM tokens and ensure user_id is nullable
CREATE TABLE IF NOT EXISTS user_fcm_tokens_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO user_fcm_tokens_v2 (id, user_id, token, platform, created_at, updated_at)
SELECT id, user_id, token, platform, created_at, updated_at FROM user_fcm_tokens;

DROP TABLE IF EXISTS user_fcm_tokens;

ALTER TABLE user_fcm_tokens_v2 RENAME TO user_fcm_tokens;

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user ON user_fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON user_fcm_tokens(token);
