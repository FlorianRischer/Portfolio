// Author: Florian Rischer
import { useEffect, useState } from 'react';
import { useTransition } from '../PageTransition/TransitionContext';
import './ProjectCard.css';
import { imagesAPI } from '../../services/api';
import { getTechnologyIconsAsync } from '../../services/technologyIcons';

// Fallback icon
const flowerIcon = imagesAPI.getUrl('flower');

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  projectUrl?: string;
  liveUrl?: string;
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
  liveUrl,
  technologies = [],
  index,
  totalItems,
  baseDelay
}: ProjectCardProps) {
  const { navigateWithTransition } = useTransition();
  const [techIcons, setTechIcons] = useState<{ name: string; icon: string }[]>([]);
  
  // Load technology icons
  useEffect(() => {
    if (technologies.length > 0) {
      getTechnologyIconsAsync(technologies).then(icons => setTechIcons(icons.slice(0, 3)));
    }
  }, [technologies]);

  const handleDetailClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    navigateWithTransition(projectUrl);
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
        <p className="project-card__description">
          {description}
          {liveUrl && (
            <button onClick={handleDetailClick} className="project-card__btn-text">
              More about this project
            </button>
          )}
        </p>
        <div className="project-card__btn-wrapper">
          <div className="project-card__btn-group">
            {liveUrl ? (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="project-card__btn">
                view project
              </a>
            ) : (
              <a href={projectUrl} onClick={handleDetailClick} className="project-card__btn">
                view project
              </a>
            )}
          </div>
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
