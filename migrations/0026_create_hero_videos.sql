CREATE TABLE IF NOT EXISTS hero_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO hero_videos (id, title, subtitle, video_url, poster_url, link_url, display_order, is_active)
VALUES (
  'hv_demo_1',
  'Luxury Orthopedic Sleep Collection',
  'Engineered with organic latex & high resilience foam',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-relaxing-in-a-comfortable-bed-41556-large.mp4',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
  '/shop',
  1,
  1
);
