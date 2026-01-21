// Author: Florian Rischer
import './FilterButtons.css';

export interface FilterOption<T extends string> {
  /** Unique identifier for the filter */
  id: T;
  /** Display label for the button */
  label: string;
}

interface FilterButtonsProps<T extends string> {
  /** Array of filter options to display */
  filters: FilterOption<T>[];
  /** Currently active filter (null if none active) */
  activeFilter: T | null;
  /** Callback when a filter is clicked */
  onFilterChange: (filter: T | null) => void;
  /** CSS class for the container (can include multiple classes) */
  className?: string;
  /** Base class name for BEM-style button classes (default: 'filter-buttons') */
  baseClassName?: string;
  /** Whether any filter is active (for positioning) */
  isFiltered?: boolean;
}

/**
 * Reusable filter buttons component for pages like Works and Contact.
 * Handles the toggle behavior and size changes automatically.
 */
export default function FilterButtons<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  className = 'filter-buttons',
  baseClassName,
  isFiltered = false
}: FilterButtonsProps<T>) {
  // Use baseClassName for button classes, or extract first class from className
  const btnBase = baseClassName || className.split(' ')[0];
  
  const getFilterSize = (filterId: T): 'large' | 'small' => {
    return activeFilter === filterId ? 'large' : 'small';
  };

  const isFilterActive = (filterId: T): boolean => {
    return activeFilter === filterId;
  };

  const handleClick = (filterId: T) => {
    onFilterChange(isFilterActive(filterId) ? null : filterId);
  };

  return (
    <div className={`${className} ${isFiltered ? `${btnBase}--filtered` : ''}`}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`${btnBase}__btn ${btnBase}__btn--${getFilterSize(filter.id)} ${
            isFilterActive(filter.id) ? `${btnBase}__btn--active` : ''
          }`}
          onClick={() => handleClick(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
