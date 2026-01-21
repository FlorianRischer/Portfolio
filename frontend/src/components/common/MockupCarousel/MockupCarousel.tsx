// Author: Florian Rischer
import { useState, useEffect } from 'react';
import { useTransition } from '../../PageTransition/TransitionContext';
import { imagesAPI } from '../../../services/api';
import './MockupCarousel.css';

// Arrow icon from API
const projectArrow = imagesAPI.getUrl('projectswaparrow');

export interface Screen {
  description: string;
  screenImage: string;
  /** Optional scale factor for the image (default: 1) */
  scale?: number;
}

interface MockupCarouselProps {
  /** Array of screens with description and image URL */
  screens: Screen[];
  /** Project title displayed in the header */
  title: string;
  /** Optional subtitle (displayed on second line) */
  subtitle?: string;
  /** Route to navigate back to (default: '/works') */
  backRoute?: string;
  /** Enable zoom functionality (default: true) */
  enableZoom?: boolean;
  /** Custom CSS class prefix for styling (default: 'mockup-carousel') */
  className?: string;
}

/**
 * Reusable Mockup Carousel component for project detail pages.
 * Features image sliding animations, navigation arrows, indicator dots,
 * and optional zoom functionality.
 */
export default function MockupCarousel({
  screens,
  title,
  subtitle,
  backRoute = '/works',
  enableZoom = true,
  className = 'mockup-carousel'
}: MockupCarouselProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [previousScreen, setPreviousScreen] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const [displayedScreen, setDisplayedScreen] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const { navigateWithTransition } = useTransition();

  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setPreviousScreen(currentScreen);
    setCurrentScreen((prev) => (prev > 0 ? prev - 1 : screens.length - 1));
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setPreviousScreen(currentScreen);
    setCurrentScreen((prev) => (prev < screens.length - 1 ? prev + 1 : 0));
  };

  const goToScreen = (index: number) => {
    if (isAnimating || index === currentScreen) return;
    setIsAnimating(true);
    setPreviousScreen(currentScreen);
    
    if (index > currentScreen) {
      setDirection('right');
    } else {
      setDirection('left');
    }
    
    setCurrentScreen(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  useEffect(() => {
    if (currentScreen !== displayedScreen) {
      Promise.resolve().then(() => {
        setIsTextTransitioning(true);
      });
      const timer = setTimeout(() => {
        Promise.resolve().then(() => {
          setDisplayedScreen(currentScreen);
          setIsTextTransitioning(false);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, displayedScreen]);

  const toggleZoom = () => {
    if (isAnimating || !enableZoom) return;
    setIsZoomed(!isZoomed);
  };

  const screen = screens[currentScreen];

  return (
    <section className={`${className} ${isZoomed ? `${className}--zoomed` : ''}`}>
      {/* Clickable area above mockup (only if zoom enabled) */}
      {enableZoom && (
        <button
          className={`${className}__click-area ${isZoomed ? `${className}__click-area--zoomed` : ''}`}
          onClick={toggleZoom}
          aria-label={isZoomed ? 'Zoom out' : 'Zoom in on mockup'}
        />
      )}

      {/* Fixed Mockup Background */}
      <div 
        className={`${className}__background ${isZoomed ? `${className}__background--zoomed` : ''}`}
      >
        {isAnimating && (
          <img
            src={screens[previousScreen].screenImage}
            alt="Previous mockup"
            className={`${className}__mockup ${className}__mockup--out-${direction}`}
            style={screens[previousScreen].scale ? { ['--mockup-scale' as string]: screens[previousScreen].scale } : undefined}
          />
        )}
        <img
          src={screen.screenImage}
          alt="Project mockup"
          className={`${className}__mockup ${isZoomed ? `${className}__mockup--zoomed` : ''} ${className}__mockup--in-${direction}`}
          style={screen.scale ? { ['--mockup-scale' as string]: screen.scale } : undefined}
          key={currentScreen}
        />
      </div>

      {/* Content overlay */}
      <div className={`${className}__content ${isZoomed ? `${className}__content--hidden` : ''}`}>
        {/* Title section */}
        <div className={`${className}__header`}>
          <button 
            className={`${className}__title-button`}
            onClick={() => navigateWithTransition(backRoute)}
            aria-label="Back to works"
          >
            <h1 className={`${className}__title`}>
              {subtitle ? (
                <>
                  {title}<br />{subtitle}
                </>
              ) : (
                title
              )}
            </h1>
          </button>
        </div>

        {/* Navigation arrows */}
        <button
          className={`${className}__arrow ${className}__arrow--left`}
          onClick={goToPrevious}
          aria-label="Previous screen"
        >
          <img src={projectArrow} alt="" className={`${className}__arrow-icon ${className}__arrow-icon--flipped`} />
        </button>

        <button
          className={`${className}__arrow ${className}__arrow--right`}
          onClick={goToNext}
          aria-label="Next screen"
        >
          <img src={projectArrow} alt="" className={`${className}__arrow-icon`} />
        </button>

        {/* Text section with description and indicators */}
        <div className={`${className}__text-section`}>
          <div className={`${className}__text-content`}>
            {/* Description */}
            <p 
              className={`${className}__description ${isTextTransitioning ? `${className}__description--transitioning-${direction}` : `${className}__description--in-${direction}`}`}
              key={`desc-${displayedScreen}`}
            >
              {screens[displayedScreen].description}
            </p>

            {/* Indicator dots */}
            <div className={`${className}__indicators`}>
              {screens.map((_, index) => (
                <button
                  key={index}
                  className={`${className}__dot ${index === currentScreen ? `${className}__dot--active` : ''} ${isAnimating && index === previousScreen ? `${className}__dot--switching` : ''} ${isAnimating && index === currentScreen ? `${className}__dot--switching-in` : ''}`}
                  onClick={() => goToScreen(index)}
                  aria-label={`Go to screen ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
