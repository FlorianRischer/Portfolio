// Author: Florian Rischer
// Dynamic technology icons - loads skills from API
import { imagesAPI, skillsAPI, type Skill } from './api';

// Cache for skills data
let skillsCache: Skill[] | null = null;
let skillsPromise: Promise<Skill[]> | null = null;

// Alias mapping for common technology name variations
const techAliases: Record<string, string> = {
  'Adobe Photoshop': 'Photoshop',
  'Adobe Illustrator': 'Illustrator',
  'Adobe InDesign': 'InDesign',
  'GitHub': 'Git',
  'GitLab': 'Git',
  'Git / GitLab GitHub': 'Git',
  'Visual Studio Code': 'VS Code',
  'HTML/CSS': 'HTML',
  'CSS': 'HTML',
  'TypeScript': 'JavaScript/TypeScript',
  'JavaScript': 'JavaScript/TypeScript',
  'React': 'JavaScript/TypeScript',
};

// Load skills from API (cached)
async function loadSkills(): Promise<Skill[]> {
  if (skillsCache) return skillsCache;
  
  if (!skillsPromise) {
    skillsPromise = skillsAPI.getAll().then(result => {
      if (result.success && result.data) {
        skillsCache = result.data;
        return result.data;
      }
      return [];
    });
  }
  
  return skillsPromise;
}

// Build dynamic mapping from skill name to icon slug
function buildIconMapping(skills: Skill[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  for (const skill of skills) {
    // Map skill name to its icon slug
    mapping[skill.name] = skill.icon;
  }
  
  // Add aliases
  for (const [alias, canonical] of Object.entries(techAliases)) {
    if (mapping[canonical]) {
      mapping[alias] = mapping[canonical];
    }
  }
  
  return mapping;
}

// Get icon URL for a technology name (async)
export async function getTechnologyIconAsync(technology: string): Promise<string | null> {
  const skills = await loadSkills();
  const mapping = buildIconMapping(skills);
  const slug = mapping[technology];
  
  if (slug) {
    return imagesAPI.getUrl(slug);
  }
  return null;
}

// Get all icons for a list of technologies (async version)
export async function getTechnologyIconsAsync(technologies: string[]): Promise<{ name: string; icon: string }[]> {
  const skills = await loadSkills();
  const mapping = buildIconMapping(skills);
  const icons: { name: string; icon: string }[] = [];
  const seenSlugs = new Set<string>();
  
  for (const tech of technologies) {
    const slug = mapping[tech];
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

// Sync version for backward compatibility (uses cached data)
export function getTechnologyIcons(technologies: string[]): { name: string; icon: string }[] {
  if (!skillsCache) {
    // Trigger loading for next call
    loadSkills();
    return [];
  }
  
  const mapping = buildIconMapping(skillsCache);
  const icons: { name: string; icon: string }[] = [];
  const seenSlugs = new Set<string>();
  
  for (const tech of technologies) {
    const slug = mapping[tech];
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

// Pre-load skills (call this early in app lifecycle)
export function preloadSkills(): void {
  loadSkills();
}
