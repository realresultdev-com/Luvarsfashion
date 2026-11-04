-- Create notifications table for Admin and User Push Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- NULL means broadcast to all administrators
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ORDER_CREATED', -- 'ORDER_CREATED', 'ORDER_PAID', 'SYSTEM'
  data TEXT, -- JSON payload with orderId, amount, customerName, etc.
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_admin ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
