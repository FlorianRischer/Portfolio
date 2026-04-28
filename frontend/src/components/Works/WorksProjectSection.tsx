import { useCallback } from 'react';
import { useTransition } from '../PageTransition/TransitionContext';
import { imagesAPI } from '../../services/api';
import './WorksProjectSection.css';

interface ProjectData {
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

interface Props {
  project: ProjectData;
  index: number;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

const categoryLabels: Record<string, string> = {
  'ux-design': 'UX/UI Design',
  'ui-design': 'UI Design',
  'branding': 'Corporate Design',
  'web-development': 'Web Development',
  'UX/UI Design': 'UX/UI Design',
  'Corporate Design': 'Corporate Design',
  'Web Development': 'Web Development',
  'Personal Art': 'Personal Art',
};

const resolveImageUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  return imagesAPI.getUrl(url);
};

export default function WorksProjectSection({ project, index, registerRef }: Props) {
  const { navigateWithTransition } = useTransition();

  const handleRef = useCallback(
    (el: HTMLElement | null) => {
      registerRef(project.id, el);
    },
    [project.id, registerRef],
  );

  const handleDetailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition(project.projectUrl);
  };

  const displayImages: string[] = [project.thumbnailUrl];
  project.screens.forEach((s) => {
    if (s.imageUrl) displayImages.push(resolveImageUrl(s.imageUrl));
  });
  project.images.forEach((img) => {
    const resolved = resolveImageUrl(img);
    if (!displayImages.includes(resolved)) displayImages.push(resolved);
  });

  const num = String(index + 1).padStart(2, '0');

  return (
    <article id={project.id} ref={handleRef} className="works-project">
      <div className="works-project__info">
        <div className="works-project__info-col works-project__info-col--title">
          <span className="works-project__number">{num}</span>
          <h2 className="works-project__title">{project.title}</h2>
          <span className="works-project__category">
            {categoryLabels[project.category] || project.category}
          </span>
        </div>

        <div className="works-project__info-col">
          <span className="works-project__label">About</span>
          <p className="works-project__description">{project.description}</p>
        </div>

        <div className="works-project__info-col">
          <span className="works-project__label">Technologies</span>
          <div className="works-project__pills">
            {project.technologies.map((tech, i) => (
              <span key={i} className="works-project__pill">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="works-project__info-col works-project__info-col--actions">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="works-project__action"
            >
              View Live ↗
            </a>
          )}
          <button
            onClick={handleDetailClick}
            className="works-project__action works-project__action--detail"
          >
            Details →
          </button>
        </div>
      </div>

      <div className="works-project__media">
        {displayImages.map((img, i) => (
          <div
            key={i}
            className={`works-project__img-wrap ${i === 0 ? 'works-project__img-wrap--hero' : ''}`}
          >
            <img
              src={img}
              alt={project.title}
              className="works-project__img"
              loading={i > 0 ? 'lazy' : undefined}
            />
          </div>
        ))}
      </div>
    </article>
  );
}
