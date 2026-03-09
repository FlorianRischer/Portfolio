// Author: Florian Rischer
import { useRef, useCallback } from 'react';

export type InputDevice = 'touchpad' | 'mouse' | 'unknown';

interface WheelDetectionResult {
  device: InputDevice;
  normalizedDelta: number;
}

/**
 * Hook to detect whether user is using touchpad or mouse wheel
 * and normalize scroll delta values accordingly.
 * 
 * Touchpad characteristics:
 * - deltaMode = 0 (pixels)
 * - Many small, frequent deltas (typically |deltaY| < 50)
 * - Smooth, inertial scrolling
 * 
 * Mouse wheel characteristics:
 * - deltaMode = 1 (lines) or 0 with larger deltas
 * - Larger, discrete deltas (typically |deltaY| >= 100 in pixel mode)
 * - Stepped scrolling
 */
export function useWheelDetection() {
  const lastEventTime = useRef<number>(0);
  const deltaHistory = useRef<number[]>([]);
  const detectedDevice = useRef<InputDevice>('unknown');

  const detectDevice = useCallback((e: WheelEvent): WheelDetectionResult => {
    const now = performance.now();
    const timeDiff = now - lastEventTime.current;
    lastEventTime.current = now;

    const absDelta = Math.abs(e.deltaY);
    
    // Track recent deltas for pattern detection
    deltaHistory.current.push(absDelta);
    if (deltaHistory.current.length > 5) {
      deltaHistory.current.shift();
    }

    // Detection heuristics
    let device: InputDevice = 'unknown';

    // Method 1: deltaMode check
    // deltaMode 1 = lines (typically mouse wheel)
    // deltaMode 0 = pixels (could be either, need more checks)
    if (e.deltaMode === 1) {
      device = 'mouse';
    } else {
      // deltaMode 0 - need to analyze delta patterns
      
      // Method 2: Delta magnitude
      // Mouse wheels in pixel mode typically produce larger deltas (100+)
      // Touchpads produce smaller, more frequent deltas
      if (absDelta >= 100 && timeDiff > 50) {
        // Large delta with gap = likely mouse
        device = 'mouse';
      } else if (absDelta < 50 && timeDiff < 30) {
        // Small delta, rapid succession = likely touchpad
        device = 'touchpad';
      } else {
        // Analyze history for consistent pattern
        const avgDelta = deltaHistory.current.reduce((a, b) => a + b, 0) / deltaHistory.current.length;
        
        if (avgDelta < 40) {
          device = 'touchpad';
        } else if (avgDelta > 80) {
          device = 'mouse';
        } else {
          // Use previous detection if uncertain
          device = detectedDevice.current !== 'unknown' ? detectedDevice.current : 'touchpad';
        }
      }
    }

    // Persist detection for consistency
    detectedDevice.current = device;

    // Normalize delta: make touchpad and mouse produce similar "intent"
    // Touchpad: use raw delta (already in pixels)
    // Mouse: multiply line-based delta for similar feel
    let normalizedDelta = e.deltaY;
    if (e.deltaMode === 1) {
      // Lines mode - multiply for pixel-like behavior
      normalizedDelta = e.deltaY * 40;
    }

    return {
      device,
      normalizedDelta
    };
  }, []);

  const getThreshold = useCallback((baseThreshold: number): number => {
    // Return adjusted threshold based on detected device
    switch (detectedDevice.current) {
      case 'touchpad':
        // Touchpad needs lower threshold (smaller deltas)
        return baseThreshold * 0.3;
      case 'mouse':
        // Mouse uses base threshold
        return baseThreshold;
      default:
        // Unknown - use middle ground
        return baseThreshold * 0.5;
    }
  }, []);

  const reset = useCallback(() => {
    deltaHistory.current = [];
    detectedDevice.current = 'unknown';
  }, []);

  return {
    detectDevice,
    getThreshold,
    reset,
    currentDevice: () => detectedDevice.current
  };
}
