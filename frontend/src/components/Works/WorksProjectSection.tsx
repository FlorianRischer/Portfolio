import { useCallback } from 'react';
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
  isVideoHero: boolean;
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
  if (url.startsWith('/api/images/')) return `https://portfolio-api.flo62616.workers.dev${url}`;
  return imagesAPI.getUrl(url);
};

function HeroVideo({ src, className }: { src: string; className?: string }) {
  return (
    <video
      src={src}
      className={className}
      preload="auto"
      autoPlay
      muted
      playsInline
      loop
    />
  );
}

export default function WorksProjectSection({ project, index, registerRef }: Props) {
  const handleRef = useCallback(
    (el: HTMLElement | null) => {
      registerRef(project.id, el);
    },
    [project.id, registerRef],
  );

  const galleryImages: string[] = project.images.map((img) => resolveImageUrl(img));

  const num = String(index + 1).padStart(2, '0');

  return (
    <article id={project.id} ref={handleRef} className="works-project" data-animate>
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
        </div>
      </div>

      <div className="works-project__hero">
        {project.isVideoHero ? (
          <HeroVideo src={project.thumbnailUrl} className="works-project__img" />
        ) : (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="works-project__img"
          />
        )}
      </div>

      {galleryImages.length > 0 && (
        <div className="works-project__gallery">
          {galleryImages.map((img, i) => (
            <div key={i} className="works-project__img-wrap">
              <img
                src={img}
                alt={project.title}
                className="works-project__img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
