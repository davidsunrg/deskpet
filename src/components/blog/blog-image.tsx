'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

type BlogImageProps = {
  src: string;
  alt: string;
  title?: string;
};

export function BlogImage({ src, alt, title }: BlogImageProps) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="relative size-full">
      {imageLoading ? (
        <Skeleton className="absolute inset-0 z-10 size-full rounded-b-none" />
      ) : null}
      <img
        src={src}
        alt={alt}
        title={title || alt}
        className={`size-full object-cover transition-transform duration-300 hover:scale-105 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
      />
    </div>
  );
}
