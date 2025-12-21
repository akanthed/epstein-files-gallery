'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { ImageMeta } from '@/lib/types';
import { getImageUrl } from '@/lib/utils';

interface ImageModalProps {
    image: ImageMeta | null;
    index: number;
    total: number;
    contextImages?: ImageMeta[];
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onJumpTo?: (index: number) => void;
}

export function ImageModal({ image, index, total, contextImages = [], onClose, onNext, onPrev, onJumpTo }: ImageModalProps) {
    const [zoom, setZoom] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Touch/swipe handling for mobile
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const hasNext = index < total - 1;
    const hasPrev = index > 0;

    useEffect(() => {
        if (image) {
            document.body.style.overflow = 'hidden';
            setZoom(1);
            setIsLoaded(false);
            setShowInfo(false);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [image]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!image) return;
        if (e.key === 'Escape') onClose();
        if ((e.key === 'ArrowRight' || e.key === 'l') && onNext) onNext();
        if ((e.key === 'ArrowLeft' || e.key === 'h') && onPrev) onPrev();
        if (e.key === '+' || e.key === '=') setZoom(prev => Math.min(prev + 0.5, 3));
        if (e.key === '-') setZoom(prev => Math.max(prev - 0.5, 0.5));
        if (e.key === '0') setZoom(1);
        if (e.key === 'i') setShowInfo(prev => !prev);
    }, [image, onClose, onNext, onPrev]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Touch handlers for swipe navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const diff = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0 && hasNext && onNext) {
                // Swiped left -> next image
                onNext();
            } else if (diff < 0 && hasPrev && onPrev) {
                // Swiped right -> previous image
                onPrev();
            }
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (!image) return null;

    const currentIndexInContext = contextImages.findIndex(img => img.id === image.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl touch-none">

            {/* Top Bar - Mobile Optimized */}
            <div className="absolute top-0 inset-x-0 h-14 md:h-16 px-3 md:px-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/70 to-transparent pointer-events-none safe-area-inset-top">

                <div className="pointer-events-auto flex items-center gap-2 md:gap-4">
                    <span className="text-white/90 font-medium text-sm md:text-lg tracking-tight">
                        {index + 1} <span className="text-white/40 font-light">/</span> {total.toLocaleString()}
                    </span>

                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`p-2 rounded-full transition ${showInfo ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
                    >
                        <Info className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>

                <div className="pointer-events-auto flex items-center gap-1 md:gap-2">
                    {/* Zoom controls - hidden on small mobile */}
                    <div className="hidden sm:flex items-center bg-black/40 rounded-full px-1 md:px-2 py-1 backdrop-blur-md border border-white/10">
                        <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-white/50 w-8 md:w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>

                    <a
                        href={getImageUrl(image.src)}
                        download
                        className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
                    >
                        <Download className="w-5 h-5" />
                    </a>

                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-red-500/80 rounded-full text-white transition backdrop-blur-md ml-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Info Overlay */}
            {showInfo && (
                <div className="absolute top-16 left-3 md:left-6 right-3 md:right-auto z-50 max-w-sm bg-black/80 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 text-sm text-zinc-300 shadow-2xl">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-blue-400" /> File Details
                    </h3>
                    <div className="space-y-1.5 font-mono text-xs break-all">
                        <div><span className="text-zinc-500">Source:</span> <span className="text-zinc-100">{image.source_pdf}</span></div>
                        <div><span className="text-zinc-500">Page:</span> {image.page}</div>
                        <div><span className="text-zinc-500">Size:</span> {image.width} x {image.height}</div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons - Always visible on mobile */}
            {hasPrev && (
                <button
                    onClick={onPrev}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white/70 active:text-white active:bg-white/20 transition-all"
                >
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
            )}

            {hasNext && (
                <button
                    onClick={onNext}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white/70 active:text-white active:bg-white/20 transition-all"
                >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
            )}

            {/* Main Image Viewport with Touch/Swipe */}
            <div
                className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden pb-20 md:pb-24 pt-14 md:pt-16 px-2 md:px-16"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="relative transition-transform duration-200 ease-out origin-center select-none max-w-full max-h-full"
                    style={{
                        transform: `scale(${zoom})`,
                    }}
                >
                    <Image
                        src={getImageUrl(image.src)}
                        alt={`Image ${index + 1}`}
                        width={image.width}
                        height={image.height}
                        quality={85}
                        className={`max-w-full max-h-[70vh] md:max-h-[80vh] w-auto h-auto object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setIsLoaded(true)}
                        priority
                        unoptimized
                    />
                </div>
            </div>

            {/* Context Strip - Smaller on mobile */}
            <div className="absolute bottom-0 inset-x-0 h-16 md:h-20 z-50 flex items-center justify-center gap-1 md:gap-2 p-2 bg-gradient-to-t from-black/90 to-transparent overflow-x-auto pointer-events-auto safe-area-inset-bottom">
                {contextImages.map((img, i) => {
                    const isActive = img.id === image.id;
                    const absoluteIndex = index + (i - currentIndexInContext);

                    return (
                        <button
                            key={img.id}
                            onClick={() => onJumpTo && onJumpTo(absoluteIndex)}
                            className={`relative h-10 w-7 md:h-16 md:w-12 flex-shrink-0 rounded overflow-hidden border transition-all duration-200 ${isActive
                                ? 'border-white scale-110 shadow-lg z-10'
                                : 'border-white/20 opacity-50 hover:opacity-100 active:opacity-100 hover:scale-105 hover:border-white/50'
                                }`}
                        >
                            <img
                                src={getImageUrl(img.thumb)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    )
                })}
            </div>

            {/* Swipe hint on mobile - show once */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 md:hidden pointer-events-none">
                <p className="text-white/30 text-xs animate-pulse">Swipe to navigate</p>
            </div>
        </div>
    );
}
