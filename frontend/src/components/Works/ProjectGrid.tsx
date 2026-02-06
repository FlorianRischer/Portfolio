// Author: Florian Rischer
import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import './ProjectGrid.css';
import { projectsAPI, imagesAPI, type Project as APIProject } from '../../services/api';

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'ux-ui-design' | 'visual-design' | 'personal-art';
  projectUrl?: string;
  technologies: string[];
}

// All images now from API
const getProjectImage = (slug: string): string => {
  return imagesAPI.getUrl(`project-${slug}-mockup`);
};

// Category mapping from API to frontend
const categoryMap: Record<string, 'ux-ui-design' | 'visual-design' | 'personal-art'> = {
  'ux-design': 'ux-ui-design',
  'ui-design': 'ux-ui-design',
  'branding': 'visual-design',
  'web-development': 'ux-ui-design',
};

// Convert API project to frontend format
const convertAPIProject = (apiProject: APIProject): Project => ({
  id: apiProject.slug,
  title: apiProject.title,
  description: apiProject.shortDescription || apiProject.description,
  image: getProjectImage(apiProject.slug),
  category: categoryMap[apiProject.category] || 'ux-ui-design',
  projectUrl: `/works/${apiProject.slug}`,
  technologies: apiProject.technologies || [],
});

// Fallback project data (used when API is unavailable)
const fallbackProjects: Project[] = [
  {
    id: 'soundcloud',
    title: 'Soundcloud',
    description: 'This redesign of an older version of the SoundCloud website was created as part of a UX and UI Design course.',
    image: imagesAPI.getUrl('project-soundcloud-mockup'),
    category: 'ux-ui-design',
    projectUrl: '/works/soundcloud',
    technologies: ['Figma', 'Adobe Photoshop', 'User Research']
  },
  {
    id: 'muenchen-budget',
    title: 'UX/UI project 2',
    description: '"München Budget" was developed as part of a Service Design module, focusing on creating a concept for a potential service offered by the City of Munich.',
    image: imagesAPI.getUrl('project-muenchen-budget-mockup'),
    category: 'ux-ui-design',
    projectUrl: '#',
    technologies: ['Figma', 'Service Design', 'User Research']
  },
  {
    id: 'slice-of-paradise',
    title: 'Slice of Paradise',
    description: '"Slice of Paradise" is a corporate design project focused on developing a fresh visual identity for a catamaran called "Slice."',
    image: imagesAPI.getUrl('project-slice-of-paradise-mockup'),
    category: 'visual-design',
    projectUrl: '/works/slice-of-paradise',
    technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Brand Strategy']
  }
];

interface ProjectGridProps {
  filter: 'ux-ui-design' | 'visual-design' | 'personal-art' | null;
  isVisible: boolean;
  isExiting: boolean;
  animationDelay: number;
}

export default function ProjectGrid({ filter, isVisible, isExiting, animationDelay }: ProjectGridProps) {
  const [allProjects, setAllProjects] = useState<Project[]>(fallbackProjects);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from API on mount
  useEffect(() => {
    const fetchProjects = async () => {
      const response = await projectsAPI.getAll();
      
      Promise.resolve().then(() => {
        if (response.success && response.data && response.data.length > 0) {
          // Convert API projects to frontend format
          const convertedProjects = response.data.map(convertAPIProject);
          setAllProjects(convertedProjects);
        }
        // If API fails, fallback data is already set
        setIsLoading(false);
      });
    };

    fetchProjects();
  }, []);

  const filteredProjects = filter 
    ? allProjects.filter(p => p.category === filter)
    : allProjects;

  const totalProjects = filteredProjects.length;

  // Convert animationDelay from ms to seconds for CSS
  const baseDelay = animationDelay / 1000;

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <div className={`project-grid ${isVisible ? 'project-grid--visible' : ''} ${isExiting ? 'project-grid--exiting' : ''}`}>
      <div 
        className="project-grid__divider"
        style={{ 
          '--stagger-delay': `${baseDelay}s`,
          '--stagger-delay-exit': `${totalProjects * 0.05}s`
        } as React.CSSProperties}
      />
      {filteredProjects.map((project, index) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          description={project.description}
          image={project.image}
          projectUrl={project.projectUrl}
          technologies={project.technologies}
          index={index}
          totalItems={totalProjects}
          baseDelay={baseDelay}
        />
      ))}
    </div>
  );
}
