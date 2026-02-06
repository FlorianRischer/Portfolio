#!/usr/bin/env node
// Admin Script for Portfolio - Manage Projects, Skills, and Images
// Run with: node workers/scripts/admin.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BUCKET_NAME = 'portfolio-images';
const DB_NAME = 'portfolio-db';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

// Execute D1 command
function executeD1(command) {
  try {
    const result = execSync(
      `npx wrangler d1 execute ${DB_NAME} --remote --command "${command.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', cwd: path.join(__dirname, '..') }
    );
    return result;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return null;
  }
}

// Upload image to R2
function uploadToR2(localPath, filename) {
  try {
    execSync(
      `npx wrangler r2 object put ${BUCKET_NAME}/${filename} --file="${localPath}"`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..') }
    );
    return true;
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return false;
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// List all projects
async function listProjects() {
  console.log('\n📁 Projects:\n');
  const result = executeD1('SELECT id, title, slug, category, featured, "order" FROM projects ORDER BY "order"');
  console.log(result);
}

// List all skills
async function listSkills() {
  console.log('\n🛠️ Skills:\n');
  const result = executeD1('SELECT id, name, category, "order" FROM skills ORDER BY category, "order"');
  console.log(result);
}

// List all images
async function listImages() {
  console.log('\n🖼️ Images:\n');
  const result = executeD1('SELECT id, name, slug, category, filename FROM images ORDER BY category, name');
  console.log(result);
}

// Add new project
async function addProject() {
  console.log('\n➕ Add New Project\n');
  
  const title = await question('Title: ');
  const slug = await question('Slug (url-friendly): ');
  const shortDescription = await question('Short Description: ');
  const description = await question('Full Description: ');
  const category = await question('Category (ux-design/ui-design/branding/web-development): ');
  const techInput = await question('Technologies (comma-separated): ');
  const technologies = JSON.stringify(techInput.split(',').map(t => t.trim()));
  const featured = (await question('Featured? (y/n): ')).toLowerCase() === 'y' ? 1 : 0;
  const order = await question('Order (number): ');
  const liveUrl = await question('Live URL (optional): ') || null;
  const githubUrl = await question('GitHub URL (optional): ') || null;

  const id = generateId();
  const now = new Date().toISOString();

  const sql = `INSERT INTO projects (id, title, slug, description, shortDescription, category, technologies, thumbnailId, thumbnailFilename, images, screens, liveUrl, githubUrl, featured, "order", createdAt, updatedAt) 
    VALUES ('${id}', '${title.replace(/'/g, "''")}', '${slug}', '${description.replace(/'/g, "''")}', '${shortDescription.replace(/'/g, "''")}', '${category}', '${technologies}', NULL, NULL, '[]', '[]', ${liveUrl ? `'${liveUrl}'` : 'NULL'}, ${githubUrl ? `'${githubUrl}'` : 'NULL'}, ${featured}, ${order}, '${now}', '${now}')`;

  executeD1(sql);
  console.log(`\n✅ Project "${title}" added with ID: ${id}`);
}

// Edit project
async function editProject() {
  await listProjects();
  const slug = await question('\nEnter slug of project to edit: ');
  
  console.log('\nLeave empty to keep current value:\n');
  
  const title = await question('New Title: ');
  const shortDescription = await question('New Short Description: ');
  const description = await question('New Full Description: ');
  const category = await question('New Category: ');
  const featured = await question('Featured? (y/n/skip): ');
  const order = await question('New Order: ');

  const updates = [];
  if (title) updates.push(`title='${title.replace(/'/g, "''")}'`);
  if (shortDescription) updates.push(`shortDescription='${shortDescription.replace(/'/g, "''")}'`);
  if (description) updates.push(`description='${description.replace(/'/g, "''")}'`);
  if (category) updates.push(`category='${category}'`);
  if (featured === 'y') updates.push(`featured=1`);
  if (featured === 'n') updates.push(`featured=0`);
  if (order) updates.push(`"order"=${order}`);
  updates.push(`updatedAt='${new Date().toISOString()}'`);

  if (updates.length > 1) {
    executeD1(`UPDATE projects SET ${updates.join(', ')} WHERE slug='${slug}'`);
    console.log(`\n✅ Project "${slug}" updated`);
  } else {
    console.log('\n⚠️ No changes made');
  }
}

// Delete project
async function deleteProject() {
  await listProjects();
  const slug = await question('\nEnter slug of project to delete: ');
  const confirm = await question(`Are you sure you want to delete "${slug}"? (yes/no): `);
  
  if (confirm === 'yes') {
    executeD1(`DELETE FROM projects WHERE slug='${slug}'`);
    console.log(`\n✅ Project "${slug}" deleted`);
  } else {
    console.log('\n❌ Cancelled');
  }
}

// Add screen to project
async function addScreen() {
  await listProjects();
  const slug = await question('\nEnter project slug: ');
  
  console.log('\n📸 Add Screen to Project\n');
  
  const screenTitle = await question('Screen Title: ');
  const screenDescription = await question('Screen Description: ');
  const imagePath = await question('Image file path (local): ');
  
  if (!fs.existsSync(imagePath)) {
    console.log('❌ Image file not found');
    return;
  }

  // Generate image slug and filename
  const ext = path.extname(imagePath);
  const imageSlug = `project-${slug}-${screenTitle.toLowerCase().replace(/\s+/g, '-')}`;
  const filename = `${imageSlug}${ext}`;
  
  // Upload image to R2
  console.log('\n📤 Uploading image...');
  if (!uploadToR2(imagePath, filename)) {
    return;
  }

  // Add image to D1
  const stats = fs.statSync(imagePath);
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/svg+xml';
  const imageId = generateId();
  
  executeD1(`INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${imageId}', '${screenTitle}', '${imageSlug}', 'project', '${mimeType}', ${stats.size}, '${filename}')`);

  // Get current screens and add new one
  console.log('\n📝 Updating project screens...');
  
  const newScreen = {
    title: screenTitle,
    description: screenDescription,
    imageUrl: `/api/images/${imageSlug}`,
    _id: imageId,
    imageFilename: filename
  };

  // Note: This is a simplified approach - in production you'd want to fetch and parse existing screens
  executeD1(`UPDATE projects SET screens=json_insert(COALESCE(screens, '[]'), '$[#]', '${JSON.stringify(newScreen).replace(/'/g, "''")}'), updatedAt='${new Date().toISOString()}' WHERE slug='${slug}'`);

  console.log(`\n✅ Screen "${screenTitle}" added to project "${slug}"`);
}

// Upload image
async function uploadImage() {
  console.log('\n🖼️ Upload Image\n');
  
  const imagePath = await question('Image file path: ');
  
  if (!fs.existsSync(imagePath)) {
    console.log('❌ Image file not found');
    return;
  }

  const name = await question('Image name: ');
  const slug = await question('Image slug (url-friendly): ');
  const category = await question('Category (project/skill/general/icon): ');

  const ext = path.extname(imagePath);
  const filename = `${slug}${ext}`;
  
  // Upload to R2
  console.log('\n📤 Uploading...');
  if (!uploadToR2(imagePath, filename)) {
    return;
  }

  // Add to D1
  const stats = fs.statSync(imagePath);
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/svg+xml';
  const id = generateId();

  executeD1(`INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${id}', '${name}', '${slug}', '${category}', '${mimeType}', ${stats.size}, '${filename}')`);

  console.log(`\n✅ Image uploaded`);
  console.log(`   URL: /api/images/${slug}`);
}

// Add skill
async function addSkill() {
  console.log('\n🛠️ Add New Skill\n');
  
  const name = await question('Skill name: ');
  const category = await question('Category (design/development/tools): ');
  const order = await question('Order (number): ');
  
  // Upload icon
  const iconPath = await question('Icon image path: ');
  
  if (!fs.existsSync(iconPath)) {
    console.log('❌ Icon file not found');
    return;
  }

  const iconSlug = `skill-${name.toLowerCase().replace(/\s+/g, '-')}`;
  const ext = path.extname(iconPath);
  const filename = `${iconSlug}${ext}`;

  console.log('\n📤 Uploading icon...');
  if (!uploadToR2(iconPath, filename)) {
    return;
  }

  // Add icon to images
  const stats = fs.statSync(iconPath);
  const mimeType = ext === '.png' ? 'image/png' : 'image/svg+xml';
  const imageId = generateId();
  
  executeD1(`INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES ('${imageId}', '${name}', '${iconSlug}', 'skill', '${mimeType}', ${stats.size}, '${filename}')`);

  // Add skill
  const skillId = generateId();
  executeD1(`INSERT INTO skills (id, name, icon, category, proficiency, "order") VALUES ('${skillId}', '${name}', '/api/images/${iconSlug}', '${category}', 3, ${order})`);

  console.log(`\n✅ Skill "${name}" added`);
}

// Main menu
async function main() {
  console.log('\n🎨 Portfolio Admin\n');
  console.log('1. List projects');
  console.log('2. Add project');
  console.log('3. Edit project');
  console.log('4. Delete project');
  console.log('5. Add screen to project');
  console.log('6. List skills');
  console.log('7. Add skill');
  console.log('8. List images');
  console.log('9. Upload image');
  console.log('0. Exit\n');

  const choice = await question('Choose option: ');

  switch (choice) {
    case '1': await listProjects(); break;
    case '2': await addProject(); break;
    case '3': await editProject(); break;
    case '4': await deleteProject(); break;
    case '5': await addScreen(); break;
    case '6': await listSkills(); break;
    case '7': await addSkill(); break;
    case '8': await listImages(); break;
    case '9': await uploadImage(); break;
    case '0': 
      rl.close();
      process.exit(0);
    default:
      console.log('Invalid option');
  }

  // Show menu again
  await main();
}

main().catch(console.error);
