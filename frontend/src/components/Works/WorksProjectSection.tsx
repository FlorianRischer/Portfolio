import { useCallback, useState, useEffect, useRef } from 'react';
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
  'branding': 'Graphic Design',
  'web-development': 'Web Development',
  'UX/UI Design': 'UX/UI Design',
  'Corporate Design': 'Graphic Design',
  'Web Development': 'Web Development',
  'Personal Art': 'Personal Art',
};

const resolveImageUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/images/')) return `https://portfolio-api.flo62616.workers.dev${url}`;
  return imagesAPI.getUrl(url);
};

function HeroVideo({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    const tryPlay = () => { video.play().catch(() => {}); };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
      return () => video.removeEventListener('canplay', tryPlay);
    }
  }, []);

  return (
    <video
      ref={videoRef}
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
  const galleryImages: string[] = project.useScreensAsGallery
    ? project.screens.map((s) => resolveImageUrl(s.imageUrl))
    : project.images.map((img) => resolveImageUrl(img));

  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleRef = useCallback(
    (el: HTMLElement | null) => {
      registerRef(project.id, el);
    },
    [project.id, registerRef],
  );

  const handleSwap = useCallback((newIndex: number | null) => {
    setSelectedGalleryIndex(newIndex);
    requestAnimationFrame(() => {
      const el = heroRef.current;
      if (!el) return;
      const lenis = (window as unknown as Record<string, unknown>).__lenis as { scrollTo: (target: HTMLElement, opts?: Record<string, unknown>) => void } | undefined;
      if (lenis) {
        lenis.scrollTo(el, { offset: -40 });
      }
    });
  }, []);

  const showingGalleryHero = selectedGalleryIndex !== null;
  const heroUrl = showingGalleryHero ? galleryImages[selectedGalleryIndex] : project.thumbnailUrl;

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

      <div ref={heroRef} className={`works-project__hero${showingGalleryHero ? ' works-project__hero--gallery' : ''}`}>
        {!showingGalleryHero && project.isVideoHero ? (
          <HeroVideo src={heroUrl} className="works-project__img" />
        ) : (
          <img
            key={heroUrl}
            src={heroUrl}
            alt={project.title}
            className="works-project__img works-project__img--fade"
          />
        )}
      </div>

      {galleryImages.length > 0 && (
        <div
          className="works-project__gallery"
          style={{ '--gallery-cols': Math.max(galleryImages.length, 3) } as React.CSSProperties}
        >
          {showingGalleryHero && (
            <button
              className="works-project__img-wrap works-project__img-wrap--placeholder"
              onClick={() => handleSwap(null)}
            >
              <span className="works-project__placeholder-text">show mockup</span>
            </button>
          )}
          {galleryImages.map((img, i) => (
            i === selectedGalleryIndex ? null : (
              <button
                key={i}
                className="works-project__img-wrap"
                onClick={() => handleSwap(i)}
              >
                <img
                  src={img}
                  alt={project.title}
                  className="works-project__img"
                  loading="lazy"
                />
              </button>
            )
          ))}
        </div>
      )}
    </article>
  );
}
