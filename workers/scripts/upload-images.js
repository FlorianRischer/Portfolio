#!/usr/bin/env node
// Script to upload images to Cloudflare R2
// Run with: node scripts/upload-images.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../../backend/exports/images');
const BUCKET_NAME = 'portfolio-images';

async function uploadImages() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Images directory not found. Run the export script first.');
    console.log('   cd backend && npm run export');
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR);
  
  if (files.length === 0) {
    console.log('⚠️ No images found to upload.');
    return;
  }

  console.log(`📤 Uploading ${files.length} images to R2 bucket: ${BUCKET_NAME}\n`);

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    
    try {
      execSync(`wrangler r2 object put ${BUCKET_NAME}/${file} --file="${filePath}"`, {
        stdio: 'inherit'
      });
      console.log(`  ✓ ${file}`);
    } catch (error) {
      console.error(`  ✗ Failed to upload ${file}:`, error.message);
    }
  }

  console.log('\n✅ Image upload complete!');
}

uploadImages();
