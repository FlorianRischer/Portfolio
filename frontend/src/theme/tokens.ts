// Author: Florian Rischer
// Design tokens — single source of truth for layout, spacing, typography, and animation constants.
// CSS custom properties in global.css mirror these values; keep them in sync.

export const LAYOUT = {
  pageMaxWidth: 1440,
  contentMaxWidth: '85vw',
  contentMaxHeight: '100vh',
  containerPadding: 'clamp(1.25rem, 3.5vw, 3.125rem)',
  filterRestingBottom: '8%',
  filterActiveBottom: '78%',
  descriptionBottom: '8%',
} as const;

export const SPACING = {
  xs: 'clamp(0.5rem, 1vw, 1rem)',
  sm: 'clamp(1rem, 2vw, 1.5rem)',
  md: 'clamp(1.5rem, 3vw, 2.5rem)',
  lg: 'clamp(2rem, 4vw, 4rem)',
  xl: 'clamp(3rem, 6vw, 6rem)',
  '2xl': 'clamp(4rem, 8vw, 8rem)',
} as const;

export const TYPOGRAPHY = {
  xs: 'clamp(0.75rem, 0.9vw, 0.875rem)',
  sm: 'clamp(0.875rem, 1vw, 1rem)',
  base: 'clamp(1rem, 1.25vw, 1.25rem)',
  lg: 'clamp(1.25rem, 1.5vw, 1.5rem)',
  xl: 'clamp(1.5rem, 2vw, 2rem)',
  '2xl': 'clamp(2rem, 3vw, 3rem)',
  '3xl': 'clamp(2.5rem, 4vw, 4rem)',
  '4xl': 'clamp(3rem, 5.5vw, 5.5rem)',
  '5xl': 'clamp(4rem, 8vw, 8rem)',
  hero: 'clamp(3.5rem, 9vw, 9rem)',
  worksTitle: 'clamp(4rem, 10vw, 9.75rem)',
} as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1800,
} as const;

export const Z_INDEX = {
  base: 0,
  content: 1,
  filters: 10,
  header: 1000,
  overlay: 5000,
  transition: 9999,
} as const;

export const COLORS = {
  black: '#000000',
  white: '#ffffff',
  yellow: '#f5a623',
  blue: '#3d66e1',
} as const;

export const ANIMATION = {
  fast: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  medium: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  slow: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const },
  staggerIn: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  staggerOut: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  staggerDelay: 0.1,
} as const;
