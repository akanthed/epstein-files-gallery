'use client';

import { useState } from 'react';
import { ImageMeta } from '@/lib/types';
import { getImageUrl } from '@/lib/utils';
import { Maximize2 } from 'lucide-react';

interface ImageCardProps {
    image: ImageMeta;
    onClick: (image: ImageMeta) => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div
            className="group relative cursor-zoom-in overflow-hidden rounded-lg bg-zinc-800 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            onClick={() => onClick(image)}
            style={{ breakInside: 'avoid', marginBottom: '1.5rem' }}
        >
            <div className={`relative w-full ${isLoading ? 'animate-pulse min-h-[200px] bg-zinc-700' : ''}`}>
                {/* Native img for maximum performance */}
                <img
                    src={getImageUrl(image.thumb)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoading(false)}
                    className={`w-full h-auto block transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-black/70 p-3 rounded-full backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                        <Maximize2 className="w-5 h-5 text-zinc-100" />
                    </div>
                </div>
            </div>
        </div>
    );
}
