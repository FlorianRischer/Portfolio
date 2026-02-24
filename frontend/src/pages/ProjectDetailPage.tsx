// Author: Florian Rischer
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { MockupCarousel, type Screen } from '../components/common/MockupCarousel';
import { PageDescription } from '../components/common/PageDescription';
import { projectsAPI, imagesAPI, type Project } from '../services/api';
import { getTechnologyIconsAsync } from '../services/technologyIcons';
import { useTransition } from '../components/PageTransition/TransitionContext';
import './ProjectDetailPage.css';

type DetailSection = 'my-role' | 'prototype-screens' | 'used-technologies';

function getCategoryDisplay(category: string): string[] {
  const normalized = category.toLowerCase().replace(/\s+/g, '-');
  switch (normalized) {
    case 'ux-design': 
    case 'ux/ui-design': return ['UX / UI', 'DESIGN'];
    case 'ui-design': return ['UI', 'DESIGN'];
    case 'branding': return ['BRAND', 'DESIGN'];
    case 'visual-design': return ['VISUAL', 'DESIGN'];
    case 'web-development': return ['WEB', 'DEV'];
    default: return [category.toUpperCase()];
  }
}

function getCategoryFilter(category: string): string | null {
  const normalized = category.toLowerCase().replace(/\s+/g, '-');
  switch (normalized) {
    case 'ux-design':
    case 'ui-design':
    case 'ux/ui-design':
    case 'web-development':
      return 'ux-ui-design';
    case 'branding':
    case 'visual-design':
      return 'visual-design';
    case 'personal-art':
      return 'personal-art';
    default:
      return null;
  }
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { navigateWithTransition } = useTransition();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DetailSection | null>(null);
  const [delayedButtonPosition, setDelayedButtonPosition] = useState<DetailSection | null>(null);
  const [techIcons, setTechIcons] = useState<{ name: string; icon: string }[]>([]);

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

  // Load technology icons
  useEffect(() => {
    if (project?.technologies) {
      getTechnologyIconsAsync(project.technologies).then(setTechIcons);
    }
  }, [project?.technologies]);

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
            {project.liveUrl ? (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="project-detail__title-link"
              >
                {project.title}
                <svg 
                  className="project-detail__title-icon" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7 17L17 7M17 7H7M17 7V17" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ) : (
              project.title
            )}
          </h1>

          {/* Category Display (default / landing state) */}
          <div 
            className={`project-detail__category ${hasActiveSection ? 'project-detail__category--hidden' : ''} ${getCategoryFilter(project.category) ? 'project-detail__category--clickable' : ''}`}
            onClick={() => {
              const filter = getCategoryFilter(project.category);
              if (filter) {
                navigateWithTransition(`/works?filter=${filter}`);
              }
            }}
          >
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
              About this project
            </button>
            <button
              className={`pd-filters__btn pd-filters__btn--${getViewSize('prototype-screens')} ${
                isViewActive('prototype-screens') ? 'pd-filters__btn--active' : ''
              }`}
              onClick={() => setActiveSection(isViewActive('prototype-screens') ? null : 'prototype-screens')}
            >
              Project Screens
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
            <PageDescription 
              className="project-detail__tech-description"
              isFiltered={activeSection === 'used-technologies'}
            >
              {project.techDescription || (
                `This project was built using ${
                  techIcons.length === 1 
                    ? techIcons[0].name
                    : techIcons.length === 2
                      ? `${techIcons[0].name} and ${techIcons[1].name}`
                      : techIcons.map((t, i) => 
                          i === techIcons.length - 1 
                            ? `and ${t.name}` 
                            : `${t.name}, `
                        ).join('')
                }.`
              )}
            </PageDescription>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
