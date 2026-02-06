// Author: Florian Rischer
// Mapping of technology names to skill icon slugs
import { imagesAPI } from './api';

// Map technology names (from projects) to skill icon slugs
const technologyToIconSlug: Record<string, string> = {
  // Design Tools
  'Figma': 'skill-figma',
  'Adobe Photoshop': 'skill-photoshop',
  'Photoshop': 'skill-photoshop',
  'Adobe Illustrator': 'skill-illustrator',
  'Illustrator': 'skill-illustrator',
  'Adobe InDesign': 'skill-indesign',
  'InDesign': 'skill-indesign',
  
  // Development
  'Git': 'skill-git',
  'GitHub': 'skill-git',
  'GitLab': 'skill-git',
  'VS Code': 'skill-vscode',
  'Visual Studio Code': 'skill-vscode',
  'Python': 'skill-python',
  'HTML': 'skill-html',
  'CSS': 'skill-html',
  'HTML/CSS': 'skill-html',
  'JavaScript': 'skill-javascript',
  'TypeScript': 'skill-javascript',
  'React': 'skill-javascript',
  'n8n': 'skill-n8n',
};

// Get icon URL for a technology name
export function getTechnologyIcon(technology: string): string | null {
  const slug = technologyToIconSlug[technology];
  if (slug) {
    return imagesAPI.getUrl(slug);
  }
  return null;
}

// Get all icons for a list of technologies (filters out those without icons)
export function getTechnologyIcons(technologies: string[]): { name: string; icon: string }[] {
  const icons: { name: string; icon: string }[] = [];
  const seenSlugs = new Set<string>();
  
  for (const tech of technologies) {
    const slug = technologyToIconSlug[tech];
    if (slug && !seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      icons.push({
        name: tech,
        icon: imagesAPI.getUrl(slug)
      });
    }
  }
  
  return icons;
}
