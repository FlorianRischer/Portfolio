const express = require('express');
const multer = require('multer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3333;

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

const WORKERS_DIR = path.join(__dirname, '../workers');
const BUCKET_NAME = 'portfolio-images';
const DB_NAME = 'portfolio-db';

// Execute D1 command
function executeD1(command) {
  try {
    const result = execSync(
      `npx wrangler d1 execute ${DB_NAME} --remote --json --command "${command.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', cwd: WORKERS_DIR }
    );
    const parsed = JSON.parse(result);
    return parsed[0]?.results || [];
  } catch (error) {
    console.error('D1 Error:', error.message);
    return [];
  }
}

// Upload to R2
function uploadToR2(localPath, filename) {
  try {
    // Convert to absolute path
    const absolutePath = path.resolve(__dirname, localPath);
    // Sanitize filename - remove spaces and special characters
    const sanitizedFilename = filename.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    console.log(`Uploading to R2: ${absolutePath} -> ${sanitizedFilename}`);
    const result = execSync(
      `npx wrangler r2 object put "${BUCKET_NAME}/${sanitizedFilename}" --file="${absolutePath}"`,
      { cwd: WORKERS_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    console.log('R2 Upload success:', result);
    return sanitizedFilename; // Return sanitized filename
  } catch (error) {
    console.error('R2 Error:', error.message);
    if (error.stderr) console.error('R2 Stderr:', error.stderr);
    if (error.stdout) console.error('R2 Stdout:', error.stdout);
    return false;
  }
}

// Generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API Routes

// Get all projects
app.get('/api/projects', (req, res) => {
  const projects = executeD1('SELECT * FROM projects ORDER BY "order"');
  res.json(projects.map(p => ({
    ...p,
    technologies: JSON.parse(p.technologies || '[]'),
    screens: JSON.parse(p.screens || '[]'),
    featured: Boolean(p.featured)
  })));
});

// Get single project
app.get('/api/projects/:slug', (req, res) => {
  const projects = executeD1(`SELECT * FROM projects WHERE slug='${req.params.slug}'`);
  if (projects.length === 0) return res.status(404).json({ error: 'Not found' });
  const p = projects[0];
  res.json({
    ...p,
    technologies: JSON.parse(p.technologies || '[]'),
    screens: JSON.parse(p.screens || '[]'),
    featured: Boolean(p.featured)
  });
});

// Create project
app.post('/api/projects', (req, res) => {
  const { title, slug, description, shortDescription, category, technologies, featured, order, liveUrl, githubUrl } = req.body;
  const id = generateId();
  const now = new Date().toISOString();
  
  executeD1(`INSERT INTO projects (id, title, slug, description, shortDescription, category, technologies, thumbnailId, thumbnailFilename, images, screens, liveUrl, githubUrl, featured, "order", createdAt, updatedAt) 
    VALUES ('${id}', '${title.replace(/'/g, "''")}', '${slug}', '${description.replace(/'/g, "''")}', '${shortDescription.replace(/'/g, "''")}', '${category}', '${JSON.stringify(technologies)}', NULL, NULL, '[]', '[]', ${liveUrl ? `'${liveUrl}'` : 'NULL'}, ${githubUrl ? `'${githubUrl}'` : 'NULL'}, ${featured ? 1 : 0}, ${order || 0}, '${now}', '${now}')`);
  
  res.json({ success: true, id });
});

// Update project
app.put('/api/projects/:slug', (req, res) => {
  const { title, description, shortDescription, category, technologies, featured, order, liveUrl, githubUrl, screens } = req.body;
  const updates = [];
  
  if (title !== undefined) updates.push(`title='${title.replace(/'/g, "''")}'`);
  if (description !== undefined) updates.push(`description='${description.replace(/'/g, "''")}'`);
  if (shortDescription !== undefined) updates.push(`shortDescription='${shortDescription.replace(/'/g, "''")}'`);
  if (category !== undefined) updates.push(`category='${category}'`);
  if (technologies !== undefined) updates.push(`technologies='${JSON.stringify(technologies)}'`);
  if (featured !== undefined) updates.push(`featured=${featured ? 1 : 0}`);
  if (order !== undefined) updates.push(`"order"=${order}`);
  if (liveUrl !== undefined) updates.push(liveUrl ? `liveUrl='${liveUrl}'` : `liveUrl=NULL`);
  if (githubUrl !== undefined) updates.push(githubUrl ? `githubUrl='${githubUrl}'` : `githubUrl=NULL`);
  if (screens !== undefined) updates.push(`screens='${JSON.stringify(screens).replace(/'/g, "''")}'`);
  updates.push(`updatedAt='${new Date().toISOString()}'`);
  
  executeD1(`UPDATE projects SET ${updates.join(', ')} WHERE slug='${req.params.slug}'`);
  res.json({ success: true });
});

// Upload project mockup/thumbnail
app.post('/api/projects/:slug/mockup', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  
  const projectSlug = req.params.slug.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const ext = path.extname(req.file.originalname);
  const imageSlug = `project-${projectSlug}-mockup`;
  const filename = `${imageSlug}${ext}`;
  
  // Upload to R2
  const uploadedFilename = uploadToR2(req.file.path, filename);
  if (!uploadedFilename) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'Upload failed' });
  }
  
  // Check if image already exists
  const existingImages = executeD1(`SELECT id FROM images WHERE slug='${imageSlug}'`);
  
  if (existingImages.length > 0) {
    // Update existing image
    executeD1(`UPDATE images SET filename='${uploadedFilename}', size=${req.file.size} WHERE slug='${imageSlug}'`);
  } else {
    // Add image to D1
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/svg+xml';
    const imageId = generateId();
    executeD1(`INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${imageId}', '${projectSlug} Mockup', '${imageSlug}', 'project', '${mimeType}', ${req.file.size}, '${uploadedFilename}')`);
  }
  
  // Update project with thumbnail
  executeD1(`UPDATE projects SET thumbnailId='${imageSlug}', thumbnailFilename='${uploadedFilename}', updatedAt='${new Date().toISOString()}' WHERE slug='${req.params.slug}'`);
  
  // Cleanup
  fs.unlinkSync(req.file.path);
  
  res.json({ success: true, filename: uploadedFilename, url: `/api/images/${imageSlug}` });
});

// Set existing image as project mockup/thumbnail
app.post('/api/projects/:slug/mockup-existing', (req, res) => {
  const { imageSlug } = req.body;
  const projectSlug = req.params.slug;
  
  // Get the image details
  const images = executeD1(`SELECT * FROM images WHERE slug='${imageSlug}'`);
  if (images.length === 0) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  const image = images[0];
  
  // Update project with thumbnail
  executeD1(`UPDATE projects SET thumbnailId='${imageSlug}', thumbnailFilename='${image.filename}', updatedAt='${new Date().toISOString()}' WHERE slug='${projectSlug}'`);
  
  res.json({ success: true, filename: image.filename, url: `/api/images/${imageSlug}` });
});

// Delete project
app.delete('/api/projects/:slug', (req, res) => {
  executeD1(`DELETE FROM projects WHERE slug='${req.params.slug}'`);
  res.json({ success: true });
});

// Get all skills
app.get('/api/skills', (req, res) => {
  const skills = executeD1('SELECT * FROM skills ORDER BY category, "order"');
  res.json(skills);
});

// Get all images
app.get('/api/images', (req, res) => {
  const images = executeD1('SELECT * FROM images ORDER BY category, name');
  res.json(images);
});

// Upload image
app.post('/api/images', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  
  const { name, slug, category } = req.body;
  const ext = path.extname(req.file.originalname);
  const filename = `${slug}${ext}`;
  
  // Upload to R2
  if (!uploadToR2(req.file.path, filename)) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'Upload failed' });
  }
  
  // Add to D1
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/svg+xml';
  const id = generateId();
  
  executeD1(`INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${id}', '${name}', '${slug}', '${category}', '${mimeType}', ${req.file.size}, '${filename}')`);
  
  // Cleanup
  fs.unlinkSync(req.file.path);
  
  res.json({ success: true, id, slug, url: `/api/images/${slug}` });
});

// Replace existing image (upload new file with same slug)
app.put('/api/images/:slug', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  
  const imageSlug = req.params.slug;
  
  // Check if image exists
  const existingImages = executeD1(`SELECT * FROM images WHERE slug='${imageSlug}'`);
  if (existingImages.length === 0) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Image not found' });
  }
  
  const existingImage = existingImages[0];
  const ext = path.extname(req.file.originalname);
  const newFilename = `${imageSlug}${ext}`;
  
  // Upload new file to R2 (will overwrite if same filename)
  const uploadedFilename = uploadToR2(req.file.path, newFilename);
  if (!uploadedFilename) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'Upload failed' });
  }
  
  // Update D1 with new file info
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/svg+xml';
  executeD1(`UPDATE images SET filename='${uploadedFilename}', mimeType='${mimeType}', size=${req.file.size} WHERE slug='${imageSlug}'`);
  
  // Cleanup
  fs.unlinkSync(req.file.path);
  
  res.json({ success: true, slug: imageSlug, filename: uploadedFilename, url: `/api/images/${imageSlug}` });
});

// Add screen to project
app.post('/api/projects/:slug/screens', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  
  const { title, description } = req.body;
  const projectSlug = req.params.slug.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const safeTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Generate image slug
  const ext = path.extname(req.file.originalname);
  const imageSlug = `project-${projectSlug}-${safeTitle}`;
  const filename = `${imageSlug}${ext}`;
  
  // Upload to R2
  const uploadedFilename = uploadToR2(req.file.path, filename);
  if (!uploadedFilename) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'Upload failed' });
  }
  
  // Add image to D1
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/svg+xml';
  const imageId = generateId();
  
  executeD1(`INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${imageId}', '${title.replace(/'/g, "''")}', '${imageSlug}', 'project', '${mimeType}', ${req.file.size}, '${uploadedFilename}')`);
  
  // Get current project
  const projects = executeD1(`SELECT screens FROM projects WHERE slug='${req.params.slug}'`);
  const currentScreens = JSON.parse(projects[0]?.screens || '[]');
  
  // Add new screen
  currentScreens.push({
    title,
    description,
    imageUrl: `/api/images/${imageSlug}`,
    _id: imageId,
    imageFilename: uploadedFilename
  });
  
  // Update project
  executeD1(`UPDATE projects SET screens='${JSON.stringify(currentScreens).replace(/'/g, "''")}', updatedAt='${new Date().toISOString()}' WHERE slug='${req.params.slug}'`);
  
  // Cleanup
  fs.unlinkSync(req.file.path);
  
  res.json({ success: true });
});

// Add existing image as screen to project
app.post('/api/projects/:slug/screens-existing', (req, res) => {
  const { title, description, imageSlug } = req.body;
  const projectSlug = req.params.slug;
  
  // Get the image details
  const images = executeD1(`SELECT * FROM images WHERE slug='${imageSlug}'`);
  if (images.length === 0) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  const image = images[0];
  
  // Get current project
  const projects = executeD1(`SELECT screens FROM projects WHERE slug='${projectSlug}'`);
  const currentScreens = JSON.parse(projects[0]?.screens || '[]');
  
  // Add new screen
  currentScreens.push({
    title,
    description,
    imageUrl: `/api/images/${imageSlug}`,
    _id: image.id,
    imageFilename: image.filename
  });
  
  // Update project
  executeD1(`UPDATE projects SET screens='${JSON.stringify(currentScreens).replace(/'/g, "''")}', updatedAt='${new Date().toISOString()}' WHERE slug='${projectSlug}'`);
  
  res.json({ success: true });
});

// Update a screen in a project
app.put('/api/projects/:slug/screens/:screenIndex', upload.single('file'), (req, res) => {
  const { title, description } = req.body;
  const projectSlug = req.params.slug;
  const screenIndex = parseInt(req.params.screenIndex);
  
  // Get current project
  const projects = executeD1(`SELECT screens FROM projects WHERE slug='${projectSlug}'`);
  const currentScreens = JSON.parse(projects[0]?.screens || '[]');
  
  if (screenIndex < 0 || screenIndex >= currentScreens.length) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Screen not found' });
  }
  
  // Update title and description
  if (title) currentScreens[screenIndex].title = title;
  if (description) currentScreens[screenIndex].description = description;
  
  // If new file uploaded, replace the image
  if (req.file) {
    const safeTitle = (title || currentScreens[screenIndex].title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const sanitizedProjectSlug = projectSlug.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
    const ext = path.extname(req.file.originalname);
    const imageSlug = `project-${sanitizedProjectSlug}-${safeTitle}`;
    const filename = `${imageSlug}${ext}`;
    
    const uploadedFilename = uploadToR2(req.file.path, filename);
    if (!uploadedFilename) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Upload failed' });
    }
    
    // Update or create image in D1
    const existingImages = executeD1(`SELECT id FROM images WHERE slug='${imageSlug}'`);
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/svg+xml';
    
    if (existingImages.length > 0) {
      executeD1(`UPDATE images SET filename='${uploadedFilename}', mimeType='${mimeType}', size=${req.file.size} WHERE slug='${imageSlug}'`);
    } else {
      const imageId = generateId();
      executeD1(`INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${imageId}', '${(title || currentScreens[screenIndex].title).replace(/'/g, "''")}', '${imageSlug}', 'project', '${mimeType}', ${req.file.size}, '${uploadedFilename}')`);
      currentScreens[screenIndex]._id = imageId;
    }
    
    currentScreens[screenIndex].imageUrl = `/api/images/${imageSlug}`;
    currentScreens[screenIndex].imageFilename = uploadedFilename;
    
    fs.unlinkSync(req.file.path);
  }
  
  // Update project
  executeD1(`UPDATE projects SET screens='${JSON.stringify(currentScreens).replace(/'/g, "''")}', updatedAt='${new Date().toISOString()}' WHERE slug='${projectSlug}'`);
  
  res.json({ success: true });
});

// Delete a screen from a project
app.delete('/api/projects/:slug/screens/:screenIndex', (req, res) => {
  const projectSlug = req.params.slug;
  const screenIndex = parseInt(req.params.screenIndex);
  
  // Get current project
  const projects = executeD1(`SELECT screens FROM projects WHERE slug='${projectSlug}'`);
  const currentScreens = JSON.parse(projects[0]?.screens || '[]');
  
  if (screenIndex < 0 || screenIndex >= currentScreens.length) {
    return res.status(404).json({ error: 'Screen not found' });
  }
  
  // Remove screen at index
  currentScreens.splice(screenIndex, 1);
  
  // Update project
  executeD1(`UPDATE projects SET screens='${JSON.stringify(currentScreens).replace(/'/g, "''")}', updatedAt='${new Date().toISOString()}' WHERE slug='${projectSlug}'`);
  
  res.json({ success: true });
});

// Reorder screens in a project
app.put('/api/projects/:slug/screens-reorder', (req, res) => {
  const { fromIndex, toIndex } = req.body;
  const projectSlug = req.params.slug;
  
  // Get current project
  const projects = executeD1(`SELECT screens FROM projects WHERE slug='${projectSlug}'`);
  const currentScreens = JSON.parse(projects[0]?.screens || '[]');
  
  if (fromIndex < 0 || fromIndex >= currentScreens.length || toIndex < 0 || toIndex >= currentScreens.length) {
    return res.status(400).json({ error: 'Invalid index' });
  }
  
  // Move screen from fromIndex to toIndex
  const [movedScreen] = currentScreens.splice(fromIndex, 1);
  currentScreens.splice(toIndex, 0, movedScreen);
  
  // Update project
  executeD1(`UPDATE projects SET screens='${JSON.stringify(currentScreens).replace(/'/g, "''")}', updatedAt='${new Date().toISOString()}' WHERE slug='${projectSlug}'`);
  
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🎨 Portfolio Admin running at http://localhost:${PORT}\n`);
});
