// Author: Florian Rischer
// Export MongoDB data for Cloudflare migration
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import Project from '../models/Project';
import Skill from '../models/Skill';
import Image from '../models/Image';

const EXPORT_DIR = path.join(__dirname, '../../exports');

async function exportData() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Create export directory
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    // Create images directory for R2
    const imagesDir = path.join(EXPORT_DIR, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Export Images to files (for R2)
    console.log('\n📸 Exporting images...');
    const images = await Image.find({});
    const imageMapping: Record<string, string> = {};
    
    for (const image of images) {
      // Convert base64 to file
      const base64Data = image.data.replace(/^data:image\/\w+;base64,/, '');
      const extension = image.mimeType.split('/')[1] || 'png';
      const filename = `${image.slug}.${extension}`;
      
      fs.writeFileSync(
        path.join(imagesDir, filename),
        Buffer.from(base64Data, 'base64')
      );
      
      // Store mapping for reference
      imageMapping[image._id.toString()] = filename;
      console.log(`  ✓ ${image.name} → ${filename}`);
    }

    // Export image metadata for D1
    const imageMetadata = images.map(img => ({
      id: img._id.toString(),
      name: img.name,
      slug: img.slug,
      category: img.category,
      mimeType: img.mimeType,
      size: img.size,
      filename: imageMapping[img._id.toString()],
    }));

    fs.writeFileSync(
      path.join(EXPORT_DIR, 'images.json'),
      JSON.stringify(imageMetadata, null, 2)
    );

    // Export Projects
    console.log('\n📁 Exporting projects...');
    const projects = await Project.find({}).lean();
    
    const projectsForD1 = projects.map(project => ({
      id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      shortDescription: project.shortDescription,
      category: project.category,
      technologies: JSON.stringify(project.technologies),
      thumbnailId: project.thumbnail?.toString() || null,
      thumbnailFilename: project.thumbnail ? imageMapping[project.thumbnail.toString()] : null,
      images: JSON.stringify(project.images || []),
      screens: JSON.stringify((project.screens || []).map(screen => ({
        ...screen,
        imageFilename: screen.image ? imageMapping[screen.image.toString()] : null,
      }))),
      liveUrl: project.liveUrl || null,
      githubUrl: project.githubUrl || null,
      featured: project.featured ? 1 : 0,
      order: project.order,
      createdAt: project.createdAt?.toISOString(),
      updatedAt: project.updatedAt?.toISOString(),
    }));

    fs.writeFileSync(
      path.join(EXPORT_DIR, 'projects.json'),
      JSON.stringify(projectsForD1, null, 2)
    );
    console.log(`  ✓ Exported ${projects.length} projects`);

    // Export Skills
    console.log('\n🛠️ Exporting skills...');
    const skills = await Skill.find({}).lean();
    
    const skillsForD1 = skills.map(skill => ({
      id: skill._id.toString(),
      name: skill.name,
      icon: skill.icon,
      category: skill.category,
      proficiency: skill.proficiency,
      order: skill.order,
    }));

    fs.writeFileSync(
      path.join(EXPORT_DIR, 'skills.json'),
      JSON.stringify(skillsForD1, null, 2)
    );
    console.log(`  ✓ Exported ${skills.length} skills`);

    // Generate D1 SQL schema
    console.log('\n📝 Generating D1 schema...');
    const schema = `
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
`;

    fs.writeFileSync(path.join(EXPORT_DIR, 'schema.sql'), schema.trim());

    // Generate seed SQL
    console.log('📝 Generating seed data SQL...');
    
    let seedSQL = '-- Seed data for D1\n\n';
    
    // Insert images
    seedSQL += '-- Images\n';
    for (const img of imageMetadata) {
      seedSQL += `INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${img.id}', '${img.name.replace(/'/g, "''")}', '${img.slug}', '${img.category}', '${img.mimeType}', ${img.size}, '${img.filename}');\n`;
    }
    
    // Insert projects
    seedSQL += '\n-- Projects\n';
    for (const proj of projectsForD1) {
      seedSQL += `INSERT INTO projects (id, title, slug, description, shortDescription, category, technologies, thumbnailId, thumbnailFilename, images, screens, liveUrl, githubUrl, featured, "order", createdAt, updatedAt) VALUES ('${proj.id}', '${proj.title.replace(/'/g, "''")}', '${proj.slug}', '${proj.description.replace(/'/g, "''")}', '${proj.shortDescription.replace(/'/g, "''")}', '${proj.category}', '${proj.technologies.replace(/'/g, "''")}', ${proj.thumbnailId ? `'${proj.thumbnailId}'` : 'NULL'}, ${proj.thumbnailFilename ? `'${proj.thumbnailFilename}'` : 'NULL'}, '${proj.images.replace(/'/g, "''")}', '${proj.screens.replace(/'/g, "''")}', ${proj.liveUrl ? `'${proj.liveUrl}'` : 'NULL'}, ${proj.githubUrl ? `'${proj.githubUrl}'` : 'NULL'}, ${proj.featured}, ${proj.order}, '${proj.createdAt}', '${proj.updatedAt}');\n`;
    }
    
    // Insert skills
    seedSQL += '\n-- Skills\n';
    for (const skill of skillsForD1) {
      seedSQL += `INSERT INTO skills (id, name, icon, category, proficiency, "order") VALUES ('${skill.id}', '${skill.name.replace(/'/g, "''")}', '${skill.icon}', '${skill.category}', ${skill.proficiency}, ${skill.order});\n`;
    }

    fs.writeFileSync(path.join(EXPORT_DIR, 'seed.sql'), seedSQL);

    console.log('\n✅ Export complete!');
    console.log(`\nExported to: ${EXPORT_DIR}`);
    console.log('Files created:');
    console.log('  - images/ (folder with image files for R2)');
    console.log('  - images.json');
    console.log('  - projects.json');
    console.log('  - skills.json');
    console.log('  - schema.sql');
    console.log('  - seed.sql');

    await mongoose.disconnect();
    console.log('\n📤 MongoDB disconnected');

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportData();
