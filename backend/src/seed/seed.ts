// Author: Florian Rischer
// Seed data for MongoDB
// Run with: npx ts-node src/seed/seed.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project';
import Skill from '../models/Skill';

dotenv.config();

const projects = [
  {
    title: 'Soundcloud',
    slug: 'soundcloud',
    description: 'This redesign of an older version of the SoundCloud website was created as part of a UX and UI Design course.',
    shortDescription: 'This redesign of an older version of the SoundCloud website was created as part of a UX and UI Design course.',
    category: 'ux-design',
    technologies: ['Figma', 'Adobe Photoshop', 'User Research'],
    thumbnailUrl: '/api/images/project-soundcloud-mockup',
    images: [],
    screens: [
      {
        title: 'Home Screen',
        description: 'The redesigned home screen with improved navigation and content discovery',
        imageUrl: '/api/images/project-soundcloud-home'
      },
      {
        title: 'Player Interface',
        description: 'The player interface has been redesigned to be intuitive and visually prominent',
        imageUrl: '/api/images/project-soundcloud-homeplayer'
      },
      {
        title: 'Discover Section',
        description: 'Improved discover page with better visual hierarchy',
        imageUrl: '/api/images/project-soundcloud-discover'
      }
    ],
    featured: true,
    order: 1
  },
  {
    title: 'UX/UI project 2',
    slug: 'muenchen-budget',
    description: '"München Budget" was developed as part of a Service Design module, focusing on creating a concept for a potential service offered by the City of Munich.',
    shortDescription: '"München Budget" was developed as part of a Service Design module, focusing on creating a concept for a potential service offered by the City of Munich.',
    category: 'ux-design',
    technologies: ['Figma', 'Service Design', 'User Research'],
    thumbnailUrl: '/api/images/project-muenchen-budget-mockup',
    images: [],
    screens: [],
    featured: true,
    order: 2
  },
  {
    title: 'Slice of Paradise',
    slug: 'slice-of-paradise',
    description: '"Slice of Paradise" is a corporate design project focused on developing a fresh visual identity for a catamaran called "Slice."',
    shortDescription: '"Slice of Paradise" is a corporate design project focused on developing a fresh visual identity for a catamaran called "Slice."',
    category: 'branding',
    technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Brand Strategy'],
    thumbnailUrl: '/api/images/project-slice-of-paradise-mockup',
    images: [],
    screens: [
      {
        title: 'Catamaran Mockup',
        description: 'The brand identity applied to the catamaran showcases how the refined visual system works in real-world applications',
        imageUrl: '/api/images/project-slice-catmockup'
      },
      {
        title: 'Logo Draft 1',
        description: 'Geometric, angular approach emphasizing dynamism and motion',
        imageUrl: '/api/images/project-slice-logodraft1'
      },
      {
        title: 'Logo Draft 2',
        description: 'Nature-inspired design incorporating a stylized hummingbird',
        imageUrl: '/api/images/project-slice-logodraft2'
      }
    ],
    featured: true,
    order: 3
  }
];

const skills = [
  { name: 'Figma', icon: 'figma.png', category: 'design', proficiency: 5, order: 1 },
  { name: 'Photoshop', icon: 'photoshop.png', category: 'design', proficiency: 4, order: 2 },
  { name: 'Illustrator', icon: 'illustrator.png', category: 'design', proficiency: 4, order: 3 },
  { name: 'InDesign', icon: 'indesign.png', category: 'design', proficiency: 3, order: 4 },
  { name: 'JavaScript', icon: 'javascript.png', category: 'development', proficiency: 3, order: 5 },
  { name: 'HTML/CSS', icon: 'html.png', category: 'development', proficiency: 4, order: 6 },
  { name: 'Python', icon: 'python.png', category: 'development', proficiency: 2, order: 7 },
  { name: 'Git', icon: 'git.png', category: 'tools', proficiency: 3, order: 8 },
  { name: 'VS Code', icon: 'vscode.png', category: 'tools', proficiency: 4, order: 9 },
  { name: 'n8n', icon: 'n8n.png', category: 'tools', proficiency: 3, order: 10 }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Project.deleteMany({});
    await Skill.deleteMany({});
    console.log('Cleared existing data');

    // Insert seed data
    await Project.insertMany(projects);
    console.log(`Inserted ${projects.length} projects`);

    await Skill.insertMany(skills);
    console.log(`Inserted ${skills.length} skills`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
