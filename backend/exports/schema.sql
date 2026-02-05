-- Cloudflare D1 Schema for Portfolio
-- Run: wrangler d1 execute portfolio-db --file=./exports/schema.sql

-- Images metadata table
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  size INTEGER NOT NULL,
  filename TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  shortDescription TEXT NOT NULL,
  category TEXT NOT NULL,
  technologies TEXT NOT NULL, -- JSON array
  thumbnailId TEXT,
  thumbnailFilename TEXT,
  images TEXT, -- JSON array
  screens TEXT, -- JSON array
  liveUrl TEXT,
  githubUrl TEXT,
  featured INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT,
  FOREIGN KEY (thumbnailId) REFERENCES images(id)
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- Messages table (for contact form)
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_images_slug ON images(slug);