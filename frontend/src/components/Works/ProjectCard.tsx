// Author: Florian Rischer
import { useTransition } from '../PageTransition/TransitionContext';
import './ProjectCard.css';
import { imagesAPI } from '../../services/api';
import { getTechnologyIcons } from '../../services/technologyIcons';

// Fallback icon
const flowerIcon = imagesAPI.getUrl('flower');

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  projectUrl?: string;
  technologies?: string[];
  index: number;
  totalItems: number;
  baseDelay: number;
}

export default function ProjectCard({ 
  title, 
  description, 
  image, 
  projectUrl = '#',
  technologies = [],
  index,
  totalItems,
  baseDelay
}: ProjectCardProps) {
  const isInternalLink = projectUrl.startsWith('/');
  const { navigateWithTransition } = useTransition();
  
  // Get technology icons (max 3)
  const techIcons = getTechnologyIcons(technologies).slice(0, 3);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isInternalLink) {
      e.preventDefault();
      navigateWithTransition(projectUrl);
    }
  };

  return (
    <article 
      className="project-card"
      style={{ 
        '--stagger-delay': `${baseDelay + 0.1 + index * 0.1}s`,
        '--stagger-delay-exit': `${(totalItems - 1 - index) * 0.05}s`
      } as React.CSSProperties}
    >
      <div className="project-card__content">
        <h2 className="project-card__title">{title}</h2>
        <p className="project-card__description">{description}</p>
        <div className="project-card__btn-wrapper">
          {isInternalLink ? (
            <a href={projectUrl} onClick={handleClick} className="project-card__btn">
              view project
            </a>
          ) : (
            <a href={projectUrl} className="project-card__btn">
              view project
            </a>
          )}
          <div className="project-card__icons">
            {techIcons.length > 0 ? (
              techIcons.map((tech, i) => (
                <img 
                  key={i} 
                  src={tech.icon} 
                  alt={tech.name} 
                  className="project-card__tech-icon" 
                  title={tech.name}
                />
              ))
            ) : (
              <img src={flowerIcon} alt="" className="project-card__icon" />
            )}
          </div>
        </div>
      </div>
      <div className="project-card__image-wrapper">
        <img 
          src={image} 
          alt={`${title} mockup`} 
          className="project-card__image"
        />
      </div>
    </article>
  );
}
