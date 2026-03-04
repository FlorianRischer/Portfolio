// Author: Florian Rischer
import { useState, useEffect, useRef } from 'react';
import './Works.css';
import ProjectGrid from './ProjectGrid';
import { PageDescription } from '../common/PageDescription';
import { FilterButtons, type FilterOption } from '../common/FilterButtons';

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

  // Show projects when user scrolls (without activating any filter)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !showProjects) {
        setShowProjects(true);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && !showProjects && activeFilter === null) {
        setShowProjects(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [showProjects, activeFilter]);

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
