// Author: Florian Rischer
import './PageDescription.css';

interface PageDescriptionProps {
  children: React.ReactNode;
  isFiltered?: boolean;
  className?: string;
  'data-skill-selected'?: string;
}

/**
 * Reusable description text component for pages (Works, About, Contact)
 * Positioned bottom-right with consistent styling across all pages
 */
export default function PageDescription({ 
  children, 
  isFiltered = false,
  className = '',
  'data-skill-selected': dataSkillSelected
}: PageDescriptionProps) {
  return (
    <div 
      className={`page-description ${isFiltered ? 'page-description--filtered' : ''} ${className}`}
      data-skill-selected={dataSkillSelected}
    >
      <p>{children}</p>
    </div>
  );
}
