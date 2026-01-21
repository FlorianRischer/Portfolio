// Author: Florian Rischer
import { useState, useRef, useEffect } from 'react';
import './Works.css';
import ProjectGrid from './ProjectGrid';
import { PageDescription } from '../common/PageDescription';
import { FilterButtons, type FilterOption } from '../common/FilterButtons';

type FilterCategory = 'ux-ui-design' | 'visual-design' | 'personal-art' | null;

const filterOptions: FilterOption<NonNullable<FilterCategory>>[] = [
  { id: 'ux-ui-design', label: 'UX/UI Design' },
  { id: 'visual-design', label: 'Visual Design' },
  { id: 'personal-art', label: 'Personal Art' }
];



export default function Works() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>(null);
  const [delayedButtonPosition, setDelayedButtonPosition] = useState<FilterCategory>(null);
  const [displayedFilter, setDisplayedFilter] = useState<FilterCategory>(null);
  const [isExiting, setIsExiting] = useState(false);
  const hasBeenActiveRef = useRef<boolean>(false);
  const prevFilterRef = useRef<FilterCategory>(null);
  const [animationDelay, setAnimationDelay] = useState<number>(0);

  // Track if filter has ever been active (update ref without setState)
  useEffect(() => {
    if (activeFilter !== null) {
      hasBeenActiveRef.current = true;
    }
  }, [activeFilter]);

  // Handle filter changes with exit animation
  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout>;
    let buttonTimer: ReturnType<typeof setTimeout>;
    
    Promise.resolve().then(() => {
      if (activeFilter !== null) {
        // Opening or switching filters
        setDelayedButtonPosition(activeFilter);
        
        // Check if we're switching from one filter to another
        if (prevFilterRef.current !== null && prevFilterRef.current !== activeFilter) {
          // Switching filters: play exit animation first
          setIsExiting(true);
          exitTimer = setTimeout(() => {
            setIsExiting(false);
            setDisplayedFilter(activeFilter);
            setAnimationDelay(0); // No delay when switching
          }, 400); // Wait for exit animation
          
          prevFilterRef.current = activeFilter;
        } else if (prevFilterRef.current === null) {
          // First time opening: delay for buttons to move up
          setAnimationDelay(300);
          setDisplayedFilter(activeFilter);
        } else {
          // Same filter, no animation needed
          setDisplayedFilter(activeFilter);
          setAnimationDelay(0);
        }
      } else {
        // Closing: play exit animation first, then hide
        if (displayedFilter !== null) {
          setIsExiting(true);
          // Wait for exit animation to complete (0.4s animation + stagger delays)
          exitTimer = setTimeout(() => {
            setIsExiting(false);
            setDisplayedFilter(null);
          }, 500);
          // Delay buttons moving down until after exit animation
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

  const hasActiveFilter = activeFilter !== null;

  return (
    <section className={`works ${hasActiveFilter ? 'works--filtered' : ''}`}>
      {/* Page title */}
      <h1 className="works__title">WORKS</h1>

      {/* Main content */}
      <div className={`works__container ${hasActiveFilter ? 'works__container--filtered' : ''}`}>
        {/* Filter buttons - left side */}
        <FilterButtons
          filters={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          className="works__filters"
          isFiltered={delayedButtonPosition !== null}
        />

        {/* Description - right side */}
        <PageDescription isFiltered={hasActiveFilter} className="works__description">
          Under the three filters you can find some selected projects I worked on privately, or during my studies — from design concepts to fully developed digital solutions. Each project reflects my growing skills in visual design, ux/ui design, web development.
        </PageDescription>
      </div>

      {/* Project Grid - shows when filter is active */}
      <ProjectGrid 
        filter={displayedFilter} 
        isVisible={displayedFilter !== null} 
        isExiting={isExiting} 
        animationDelay={animationDelay} 
      />
    </section>
  );
}
