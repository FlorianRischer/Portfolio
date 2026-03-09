// Author: Florian Rischer
import { useState, useEffect, useRef } from 'react';
import './Works.css';
import ProjectGrid from './ProjectGrid';
import { PageDescription } from '../common/PageDescription';
import { FilterButtons, type FilterOption } from '../common/FilterButtons';
import { useWheelDetection } from '../../hooks/useWheelDetection';

type FilterCategory = 'ux-ui-design' | 'corporate-design' | 'web-development' | null;

const filterOptions: FilterOption<NonNullable<FilterCategory>>[] = [
  { id: 'web-development', label: 'Web Development' },
  { id: 'corporate-design', label: 'Corporate Design' },
  { id: 'ux-ui-design', label: 'UX/UI Design' }
];

export default function Works() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [delayedButtonPosition, setDelayedButtonPosition] = useState<FilterCategory>(null);
  const [displayedFilter, setDisplayedFilter] = useState<FilterCategory>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [animationDelay, setAnimationDelay] = useState<number>(0);
  const prevFilterRef = useRef<FilterCategory>(null);
  const accumulatedDelta = useRef<number>(0);
  const activationCooldown = useRef<number>(0);
  const { detectDevice, getThreshold } = useWheelDetection();

  // Show projects when user scrolls (without activating any filter)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !showProjects) {
        setShowProjects(true);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const now = performance.now();
      
      // Check if we're in cooldown period (after activation)
      if (activationCooldown.current > 0) {
        const timeSinceActivation = now - activationCooldown.current;
        
        // During first 500ms after activation: block all scroll
        if (timeSinceActivation < 500) {
          e.preventDefault();
          return;
        }
        
        // Between 500ms-1000ms: reduced sensitivity (ignore small deltas)
        if (timeSinceActivation < 1000) {
          const absDelta = Math.abs(e.deltaY);
          if (absDelta < 30) {
            e.preventDefault();
            return;
          }
        }
        
        // After 1000ms: clear cooldown
        if (timeSinceActivation >= 1000) {
          activationCooldown.current = 0;
        }
      }
      
      if (showProjects || activeFilter !== null) return;
      
      // Detect device and get normalized delta
      const { normalizedDelta } = detectDevice(e);
      
      if (normalizedDelta > 0) {
        // Accumulate scroll delta
        accumulatedDelta.current += normalizedDelta;
        
        // Low threshold - single scroll tick should activate
        const threshold = getThreshold(30);
        
        if (accumulatedDelta.current >= threshold) {
          // Activate projects
          setShowProjects(true);
          
          // Reset accumulated delta to eat up remaining scroll momentum
          accumulatedDelta.current = 0;
          
          // Start cooldown period to prevent over-scrolling
          activationCooldown.current = now;
          
          // Prevent default scroll for this event
          e.preventDefault();
        }
      } else {
        // Reset accumulator if scrolling up
        accumulatedDelta.current = 0;
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [showProjects, activeFilter, detectDevice, getThreshold]);

  // Handle filter changes with exit animation
  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout>;
    let buttonTimer: ReturnType<typeof setTimeout>;
    
    Promise.resolve().then(() => {
      if (activeFilter !== null) {
        // Filter clicked - show projects and set filter
        setShowProjects(true);
        setDelayedButtonPosition(activeFilter);
        
        if (prevFilterRef.current !== null && prevFilterRef.current !== activeFilter) {
          // Switching filters
          setIsExiting(true);
          exitTimer = setTimeout(() => {
            setIsExiting(false);
            setDisplayedFilter(activeFilter);
            setAnimationDelay(0);
          }, 400);
          prevFilterRef.current = activeFilter;
        } else if (prevFilterRef.current === null) {
          // First time clicking filter
          setAnimationDelay(300);
          setDisplayedFilter(activeFilter);
          prevFilterRef.current = activeFilter;
        } else {
          setDisplayedFilter(activeFilter);
          setAnimationDelay(0);
        }
      } else {
        // Filter deactivated - show all projects
        if (displayedFilter !== null) {
          setIsExiting(true);
          exitTimer = setTimeout(() => {
            setIsExiting(false);
            setDisplayedFilter(null);
          }, 400);
          buttonTimer = setTimeout(() => {
            setDelayedButtonPosition(null);
          }, 100);
          prevFilterRef.current = null;
        }
      }
    });
    
    return () => {
      if (exitTimer) clearTimeout(exitTimer);
      if (buttonTimer) clearTimeout(buttonTimer);
    };
  }, [activeFilter, displayedFilter]);

  return (
    <section className={`works ${showProjects ? 'works--filtered' : ''}`}>
      {/* Page title */}
      <h1 className="works__title">WORKS</h1>

      {/* Main content */}
      <div className={`works__container ${showProjects ? 'works__container--filtered' : ''}`}>
        {/* Filter buttons - left side (clickable) */}
        <FilterButtons
          filters={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          className="works__filters filter-buttons"
          baseClassName="filter-buttons"
          isFiltered={delayedButtonPosition !== null || showProjects}
        />

        {/* Description - right side */}
        <PageDescription isFiltered={showProjects} className="works__description">
          On this page, I'm giving you an overview of the projects I worked on during my studies — from design concepts to fully developed digital solutions. Each project reflects my growing skills in visual design, UX/UI, and web development.
        </PageDescription>
      </div>

      {/* Project Grid - shows when scrolling or filter active */}
      <ProjectGrid 
        filter={displayedFilter}
        isVisible={showProjects} 
        isExiting={isExiting} 
        animationDelay={animationDelay} 
      />
    </section>
  );
}
