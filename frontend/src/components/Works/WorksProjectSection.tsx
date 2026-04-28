import { useCallback, useState, useEffect, useRef } from 'react';
import { imagesAPI } from '../../services/api';
import { MockupCarousel, type Screen } from '../common/MockupCarousel';
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
  useScreensAsGallery?: boolean;
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

function ScreensOverlay({
  screens,
  title,
  onClose,
}: {
  screens: Screen[];
  title: string;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const handleClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    overlayRef.current?.classList.add('screens-overlay--closing');
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  return (
    <div ref={overlayRef} className="screens-overlay" onClick={handleClose}>
      <div className="screens-overlay__content" onClick={(e) => e.stopPropagation()}>
        <button className="screens-overlay__close" onClick={handleClose} aria-label="Close">
          ✕
        </button>
        <MockupCarousel screens={screens} title={title} />
      </div>
    </div>
  );
}

export default function WorksProjectSection({ project, index, registerRef }: Props) {
  const [showScreens, setShowScreens] = useState(false);

  const handleRef = useCallback(
    (el: HTMLElement | null) => {
      registerRef(project.id, el);
    },
    [project.id, registerRef],
  );

  const galleryImages: string[] = project.useScreensAsGallery
    ? project.screens.map((s) => resolveImageUrl(s.imageUrl))
    : project.images.map((img) => resolveImageUrl(img));

  const screens: Screen[] = project.screens.map((s) => ({
    description: '',
    screenImage: resolveImageUrl(s.imageUrl),
    scale: 1,
  }));

  const hasScreens = screens.length > 0;

  const num = String(index + 1).padStart(2, '0');

  return (
    <>
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
              <button
                key={i}
                className="works-project__img-wrap"
                onClick={hasScreens ? () => setShowScreens(true) : undefined}
                style={hasScreens ? { cursor: 'pointer' } : undefined}
              >
                <img
                  src={img}
                  alt={project.title}
                  className="works-project__img"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </article>

      {showScreens && (
        <ScreensOverlay
          screens={screens}
          title={project.title}
          onClose={() => setShowScreens(false)}
        />
      )}
    </>
  );
}
