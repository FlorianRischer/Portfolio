// Author: Florian Rischer
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { MockupCarousel, type Screen } from '../components/common/MockupCarousel';
import { PageDescription } from '../components/common/PageDescription';
import { projectsAPI, imagesAPI, type Project } from '../services/api';
import { getTechnologyIcons } from '../services/technologyIcons';
import './ProjectDetailPage.css';

type DetailSection = 'my-role' | 'prototype-screens' | 'used-technologies';

function getCategoryDisplay(category: string): string[] {
  switch (category) {
    case 'ux-design': return ['UX / UI', 'DESIGN'];
    case 'ui-design': return ['UI', 'DESIGN'];
    case 'branding': return ['BRAND', 'DESIGN'];
    case 'web-development': return ['WEB', 'DEV'];
    default: return [category.toUpperCase()];
  }
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DetailSection | null>(null);
  const [delayedButtonPosition, setDelayedButtonPosition] = useState<DetailSection | null>(null);

  // Section visibility tracking for exit animations
  const [hasBeenActive, setHasBeenActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo(0, -1000);
  }, []);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      setLoading(true);
      const result = await projectsAPI.getBySlug(slug);
      if (result.success && result.data) {
        setProject(result.data);
        setError(null);
      } else {
        setError(result.error || 'Project not found');
      }
      setLoading(false);
    }
    loadProject();
  }, [slug]);

  // Track which sections have been active (for exit animations)
  useEffect(() => {
    if (activeSection) {
      Promise.resolve().then(() => {
        setHasBeenActive(prev => ({ ...prev, [activeSection]: true }));
      });
    }
  }, [activeSection]);

  // Delay button position class (wait for exit animation)
  useEffect(() => {
    if (activeSection !== null) {
      Promise.resolve().then(() => {
        setDelayedButtonPosition(activeSection);
      });
    } else {
      const timer = setTimeout(() => setDelayedButtonPosition(null), 100);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  if (loading) {
    return (
      <main>
        <PageContainer>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            fontSize: 'var(--font-xl)'
          }}>
            Loading...
          </div>
        </PageContainer>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main>
        <PageContainer>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            gap: '1rem'
          }}>
            <h1 style={{ fontSize: 'var(--font-3xl)' }}>Project Not Found</h1>
            <p style={{ fontSize: 'var(--font-base)', color: '#666' }}>{error}</p>
          </div>
        </PageContainer>
      </main>
    );
  }

  // Convert project screens to MockupCarousel format
  const screens: Screen[] = project.screens.map(screen => ({
    description: screen.description,
    screenImage: screen.imageUrl.startsWith('/api')
      ? imagesAPI.getUrl(screen.imageUrl.replace('/api/images/', ''))
      : screen.imageUrl,
    scale: 1
  }));

  // Determine if zoom should be enabled based on category
  const enableZoom = project.category === 'ui-design' || project.category === 'ux-design';

  const techIcons = getTechnologyIcons(project.technologies);
  const hasActiveSection = activeSection !== null;
  const categoryLines = getCategoryDisplay(project.category);

  const getViewSize = (view: DetailSection): 'large' | 'small' => {
    return activeSection === view ? 'large' : 'small';
  };

  const isViewActive = (view: DetailSection): boolean => {
    return activeSection === view;
  };

  const getButtonPositionClass = (): string => {
    if (!delayedButtonPosition) return '';
    return `pd-filters--${delayedButtonPosition}-active`;
  };

  return (
    <main>
      <PageContainer>
        <section className={`project-detail ${hasActiveSection ? 'project-detail--filtered' : ''}`}>
          {/* Project Title */}
          <h1 className={`project-detail__title ${hasActiveSection ? 'project-detail__title--right' : ''}`}>
            {project.title}
          </h1>

          {/* Category Display (default / landing state) */}
          <div className={`project-detail__category ${hasActiveSection ? 'project-detail__category--hidden' : ''}`}>
            {categoryLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {/* Section Navigation */}
          <div className={`pd-filters ${getButtonPositionClass()}`}>
            <button
              className={`pd-filters__btn pd-filters__btn--${getViewSize('my-role')} ${
                isViewActive('my-role') ? 'pd-filters__btn--active' : ''
              }`}
              onClick={() => setActiveSection(isViewActive('my-role') ? null : 'my-role')}
            >
              My Role
            </button>
            <button
              className={`pd-filters__btn pd-filters__btn--${getViewSize('prototype-screens')} ${
                isViewActive('prototype-screens') ? 'pd-filters__btn--active' : ''
              }`}
              onClick={() => setActiveSection(isViewActive('prototype-screens') ? null : 'prototype-screens')}
            >
              Prototype Screens
            </button>
            <button
              className={`pd-filters__btn pd-filters__btn--${getViewSize('used-technologies')} ${
                isViewActive('used-technologies') ? 'pd-filters__btn--active' : ''
              }`}
              onClick={() => setActiveSection(isViewActive('used-technologies') ? null : 'used-technologies')}
            >
              Used Technologies
            </button>
          </div>

          {/* Description (default state, hidden when section active) */}
          <PageDescription isFiltered={hasActiveSection} className="project-detail__description">
            {project.description}
          </PageDescription>

          {/* My Role Section */}
          <div className={`project-detail__section project-detail__role-section ${
            activeSection === 'my-role' ? 'project-detail__section--visible' : ''
          } ${hasBeenActive['my-role'] && activeSection !== 'my-role' ? 'project-detail__section--exiting' : ''}`}>
            <p className="project-detail__role-text">{project.description}</p>
          </div>

          {/* Prototype Screens Section */}
          <div className={`project-detail__section project-detail__screens-section ${
            activeSection === 'prototype-screens' ? 'project-detail__section--visible' : ''
          } ${hasBeenActive['prototype-screens'] && activeSection !== 'prototype-screens' ? 'project-detail__section--exiting' : ''}`}>
            <MockupCarousel
              screens={screens}
              title={project.title}
              backRoute="/works"
              enableZoom={enableZoom}
            />
          </div>

          {/* Used Technologies Section */}
          <div className={`project-detail__section project-detail__tech-section ${
            activeSection === 'used-technologies' ? 'project-detail__section--visible' : ''
          } ${hasBeenActive['used-technologies'] && activeSection !== 'used-technologies' ? 'project-detail__section--exiting' : ''}`}>
            <div className="project-detail__tech-list">
              {techIcons.map((tech, index) => (
                <div
                  key={tech.name}
                  className="project-detail__tech-item"
                  style={{
                    '--stagger-delay': `${0.1 + index * 0.1}s`,
                    '--stagger-delay-exit': `${(techIcons.length - index) * 0.05}s`
                  } as React.CSSProperties}
                >
                  <div className="project-detail__tech-icon">
                    <img src={tech.icon} alt={tech.name} />
                  </div>
                  <span className="project-detail__tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
