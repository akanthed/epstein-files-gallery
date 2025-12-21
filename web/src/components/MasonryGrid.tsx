'use client';

import { useState, useMemo } from 'react';
import { ImageMeta } from '@/lib/types';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
    images: ImageMeta[];
    onImageClick: (image: ImageMeta) => void;
}

export function MasonryGrid({ images, onImageClick }: MasonryGridProps) {
    // Simple CSS Column masonry implementation
    // It's robust and lightweight compared to JS calculation

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 p-1">
            {images.map((img) => (
                <ImageCard key={img.id} image={img} onClick={onImageClick} />
            ))}
        </div>
    );
}
