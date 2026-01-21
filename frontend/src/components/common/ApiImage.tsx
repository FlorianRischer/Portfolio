// Author: Florian Rischer
import { useState, useEffect } from 'react';
import { imagesAPI } from '../../services/api';

interface ApiImageProps {
  slug: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Image component that loads from API with fallback to local file
 */
export default function ApiImage({ 
  slug, 
  fallbackSrc, 
  alt, 
  className, 
  style,
  onLoad,
  onError 
}: ApiImageProps) {
  const [src, setSrc] = useState<string>(imagesAPI.getUrl(slug));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setSrc(fallbackSrc);
    }
    onError?.();
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}

/**
 * Hook to get image URL from API with fallback
 */
export function useApiImage(slug: string, fallbackSrc?: string): string {
  const [src, setSrc] = useState<string>(imagesAPI.getUrl(slug));

  useEffect(() => {
    // Test if the API image is accessible
    const img = new Image();
    img.onload = () => {
      setSrc(imagesAPI.getUrl(slug));
    };
    img.onerror = () => {
      if (fallbackSrc) {
        setSrc(fallbackSrc);
      }
    };
    img.src = imagesAPI.getUrl(slug);
  }, [slug, fallbackSrc]);

  return src;
}
