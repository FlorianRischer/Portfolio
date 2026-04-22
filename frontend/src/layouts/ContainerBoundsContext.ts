// Author: Florian Rischer
import { createContext } from 'react';
import type { ContainerBounds } from '../hooks/useContainerBounds';

interface ContainerBoundsContextValue {
  bounds: ContainerBounds;
  updateBounds: () => void;
}

export const ContainerBoundsContext = createContext<ContainerBoundsContextValue>({
  bounds: { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 },
  updateBounds: () => {},
});

