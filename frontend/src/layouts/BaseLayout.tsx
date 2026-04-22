// Author: Florian Rischer
import type { ReactNode } from 'react';
import { useContainerBounds } from '../hooks/useContainerBounds';
import { ContainerBoundsContext } from './ContainerBoundsContext';
import './BaseLayout.css';

interface BaseLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  fullBleed?: boolean;
  className?: string;
}

export default function BaseLayout({
  children,
  scrollable = false,
  fullBleed = false,
  className = '',
}: BaseLayoutProps) {
  const { ref, bounds, updateBounds } = useContainerBounds();

  return (
    <main
      className={`base-layout ${scrollable ? 'base-layout--scrollable' : ''} ${className}`}
    >
      <div className="base-layout__page-container">
        <ContainerBoundsContext.Provider value={{ bounds, updateBounds }}>
          {fullBleed ? (
            children
          ) : (
            <div ref={ref} className="base-layout__content">
              {children}
            </div>
          )}
        </ContainerBoundsContext.Provider>
      </div>
    </main>
  );
}
