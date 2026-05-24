import React, { useState, useEffect } from 'react';
import { resolveUrl } from '../utils/db';

interface ResolvedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const ResolvedImage: React.FC<ResolvedImageProps> = ({ src, alt, className, ...props }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    resolveUrl(src).then((url) => {
      if (active) {
        setResolvedSrc(url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80');
      }
    });

    return () => {
      active = false;
    };
  }, [src]);

  return (
    <img
      src={resolvedSrc || null}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
