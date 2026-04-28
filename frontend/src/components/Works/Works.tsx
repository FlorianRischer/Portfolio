// Author: Florian Rischer
import { useState, useEffect, useRef, useCallback } from 'react';
import './Works.css';
import WorksSidebar from './WorksSidebar';
import WorksProjectSection from './WorksProjectSection';
import { projectsAPI, imagesAPI, type Project as APIProject } from '../../services/api';

interface WorksProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  thumbnailUrl: string;
  images: string[];
  screens: { title: string; description: string; imageUrl: string }[];
  liveUrl?: string;
  projectUrl: string;
}

const convertProject = (p: APIProject): WorksProject => ({
  id: p.slug,
  slug: p.slug,
  title: p.title,
  description: p.shortDescription || p.description,
  category: p.category,
  technologies: p.technologies || [],
  thumbnailUrl: imagesAPI.getUrl(`project-${p.slug}-mockup`),
  images: p.images || [],
  screens: p.screens || [],
  liveUrl: p.liveUrl,
  projectUrl: `/works/${p.slug}`,
});

export default function Works() {
  const [projects, setProjects] = useState<WorksProject[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await projectsAPI.getAll();
      if (response.success && response.data?.length) {
        setProjects(response.data.map(convertProject));
      }
      setIsLoading(false);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!projects.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = projects.findIndex((p) => p.id === entry.target.id);
            if (idx !== -1 && entry.intersectionRatio > bestRatio) {
              bestIndex = idx;
              bestRatio = entry.intersectionRatio;
            }
          }
        }
        if (bestIndex !== -1) setActiveIndex(bestIndex);
      },
      { threshold: [0.1, 0.3, 0.5], rootMargin: '-10% 0px -10% 0px' },
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [projects]);

  const scrollToProject = useCallback(
    (index: number) => {
      const project = projects[index];
      if (!project) return;
      const el = sectionRefs.current.get(project.id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [projects],
  );

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  }, []);

  if (isLoading) return null;

  return (
    <div className="works-page">
      <WorksSidebar
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
        activeIndex={activeIndex}
        onProjectClick={scrollToProject}
      />
      <div className="works-page__content">
        <header className="works-page__header">
          <h1 className="works-page__heading">Selected Works</h1>
          <p className="works-page__intro">
            An overview of my projects — from design concepts to fully developed digital solutions,
            reflecting my skills in visual design, UX/UI, and web development.
          </p>
        </header>
        {projects.map((project, index) => (
          <WorksProjectSection
            key={project.id}
            project={project}
            index={index}
            registerRef={registerRef}
          />
        ))}
      </div>
    </div>
  );
}
