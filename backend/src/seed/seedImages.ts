// Author: Florian Rischer
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Image from '../models/Image';

dotenv.config();

const IMAGES_BASE_PATH = path.join(__dirname, '../../../frontend/src/assets/images');

interface ImageToSeed {
  name: string;
  slug: string;
  category: 'project' | 'skill' | 'general' | 'icon';
  filePath: string;
}

// Define all images to seed
const imagesToSeed: ImageToSeed[] = [
  // General images
  { name: 'About Image', slug: 'aboutimage', category: 'general', filePath: 'aboutimage.png' },
  { name: 'Contact Image', slug: 'contactimage', category: 'general', filePath: 'contactimage.png' },
  { name: 'Profile', slug: 'profile', category: 'general', filePath: 'profile.png' },
  { name: 'Flower', slug: 'flower', category: 'general', filePath: 'flower.png' },
  
  // Icons/SVGs
  { name: 'Arrow', slug: 'arrow', category: 'icon', filePath: 'arrow.svg' },
  { name: 'Vector', slug: 'vector', category: 'icon', filePath: 'vector.svg' },
  { name: 'Line', slug: 'line', category: 'icon', filePath: 'line.svg' },
  { name: 'Profile SVG', slug: 'profile-svg', category: 'icon', filePath: 'profile.svg' },
  { name: 'Project Swap Arrow', slug: 'projectswaparrow', category: 'icon', filePath: 'projectswaparrow.svg' },
  
  // Skill icons
  { name: 'Git', slug: 'skill-git', category: 'skill', filePath: 'skills/git.png' },
  { name: 'VS Code', slug: 'skill-vscode', category: 'skill', filePath: 'skills/vscode.png' },
  { name: 'Python', slug: 'skill-python', category: 'skill', filePath: 'skills/python.png' },
  { name: 'HTML', slug: 'skill-html', category: 'skill', filePath: 'skills/html.png' },
  { name: 'JavaScript', slug: 'skill-javascript', category: 'skill', filePath: 'skills/javascript.png' },
  { name: 'n8n', slug: 'skill-n8n', category: 'skill', filePath: 'skills/n8n.png' },
  { name: 'Photoshop', slug: 'skill-photoshop', category: 'skill', filePath: 'skills/photoshop.png' },
  { name: 'Illustrator', slug: 'skill-illustrator', category: 'skill', filePath: 'skills/illustrator.png' },
  { name: 'InDesign', slug: 'skill-indesign', category: 'skill', filePath: 'skills/indesign.png' },
  { name: 'Figma', slug: 'skill-figma', category: 'skill', filePath: 'skills/figma.png' },
  
  // Project mockups
  { name: 'Soundcloud Mockup', slug: 'project-soundcloud-mockup', category: 'project', filePath: 'projects/soundcloud-mockup.png' },
  { name: 'München Budget Mockup', slug: 'project-muenchen-budget-mockup', category: 'project', filePath: 'projects/muenchen-budget-mockup.png' },
  { name: 'Slice of Paradise Mockup', slug: 'project-slice-of-paradise-mockup', category: 'project', filePath: 'projects/slice-of-paradise-mockup.png' },
  
  // Soundcloud project images
  { name: 'Soundcloud Home', slug: 'project-soundcloud-home', category: 'project', filePath: 'projects/soundcloud/soundcloud_mockups/home.png' },
  { name: 'Soundcloud Home Player', slug: 'project-soundcloud-homeplayer', category: 'project', filePath: 'projects/soundcloud/soundcloud_mockups/homeplayer.png' },
  { name: 'Soundcloud Home Dropdown', slug: 'project-soundcloud-homedropdown', category: 'project', filePath: 'projects/soundcloud/soundcloud_mockups/homeDropdown.png' },
  { name: 'Soundcloud Discover', slug: 'project-soundcloud-discover', category: 'project', filePath: 'projects/soundcloud/soundcloud_mockups/discover.png' },
  { name: 'Soundcloud Discover Player', slug: 'project-soundcloud-discoverplayer', category: 'project', filePath: 'projects/soundcloud/soundcloud_mockups/discoverplayer.png' },
  { name: 'Soundcloud Playlist', slug: 'project-soundcloud-playlist', category: 'project', filePath: 'projects/soundcloud/soundcloud_mockups/playlist.png' },
  { name: 'Soundcloud Playlist Player', slug: 'project-soundcloud-playlistplayer', category: 'project', filePath: 'projects/soundcloud/soundcloud_mockups/playlistplayer.png' },
  
  // Slice of Paradise project images
  { name: 'Slice of Paradise Initial Design', slug: 'project-slice-initial-design', category: 'project', filePath: 'projects/sliceofparadise/initial-design.png' },
  { name: 'Slice of Paradise Old', slug: 'project-slice-old', category: 'project', filePath: 'projects/sliceofparadise/sliceold.png' },
  { name: 'Slice of Paradise Cat Mockup', slug: 'project-slice-catmockup', category: 'project', filePath: 'projects/sliceofparadise/catmockup2.png' },
  { name: 'Slice of Paradise Logo Draft 1', slug: 'project-slice-logodraft1', category: 'project', filePath: 'projects/sliceofparadise/logodraft1.svg' },
  { name: 'Slice of Paradise Logo Draft 2', slug: 'project-slice-logodraft2', category: 'project', filePath: 'projects/sliceofparadise/logodraft2.svg' },
];

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function seedImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
    console.log('✅ Connected to MongoDB');

    // Clear existing images
    await Image.deleteMany({});
    console.log('🗑️  Cleared existing images');

    let successCount = 0;
    let errorCount = 0;

    for (const img of imagesToSeed) {
      const fullPath = path.join(IMAGES_BASE_PATH, img.filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${img.filePath}`);
        errorCount++;
        continue;
      }

      try {
        const fileBuffer = fs.readFileSync(fullPath);
        const base64Data = fileBuffer.toString('base64');
        const mimeType = getMimeType(img.filePath);

        const image = new Image({
          name: img.name,
          slug: img.slug,
          category: img.category,
          mimeType,
          data: base64Data,
          size: fileBuffer.length,
        });

        await image.save();
        console.log(`✅ Seeded: ${img.name} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
        successCount++;
      } catch (err) {
        console.log(`❌ Error seeding ${img.name}:`, err);
        errorCount++;
      }
    }

    console.log('\n📊 Seed Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📁 Total: ${imagesToSeed.length}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedImages();
