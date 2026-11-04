-- Dynamic Admin Access
-- Admin permissions are managed dynamically via the D1 database (users.role = 'ADMIN').

INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES
  ('user_demo', 'Demo User', 'user@buddymattress.com', '$2a$10$abcdefghijklmnopqrstuv', 'USER'),
  ('user_admin', 'Admin User', 'admin@buddymattress.com', '$2a$10$abcdefghijklmnopqrstuv', 'ADMIN');

