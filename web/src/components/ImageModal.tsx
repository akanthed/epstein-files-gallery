'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, Info, Keyboard } from 'lucide-react';
import { ImageMeta } from '@/lib/types';

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
    const [showShortcuts, setShowShortcuts] = useState(false);

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
        if (e.key === '?') setShowShortcuts(prev => !prev);
    }, [image, onClose, onNext, onPrev]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!image) return null;

    // Find the position of current image in the context slice for jump calculation
    const currentIndexInContext = contextImages.findIndex(img => img.id === image.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl">

            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 h-16 px-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">

                <div className="pointer-events-auto flex items-center gap-4">
                    <span className="text-white/90 font-medium text-lg tracking-tight">
                        Image {index + 1} <span className="text-white/40 font-light">of</span> {total.toLocaleString()}
                    </span>

                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`p-2 rounded-full transition ${showInfo ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
                        title="Toggle Details (i)"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">

                    <div className="hidden md:flex items-center bg-black/40 rounded-full px-2 py-1 backdrop-blur-md border border-white/10 mr-4">
                        <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-white/50 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowShortcuts(!showShortcuts)}
                        className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition hidden sm:block"
                        title="Keyboard Shortcuts (?)"
                    >
                        <Keyboard className="w-5 h-5" />
                    </button>

                    <a
                        href={image.src}
                        download
                        className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
                        title="Download Original"
                    >
                        <Download className="w-5 h-5" />
                    </a>

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-red-500/80 rounded-full text-white transition backdrop-blur-md"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Info Overlay */}
            {showInfo && (
                <div className="absolute top-20 left-6 z-50 max-w-sm bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-sm text-zinc-300 shadow-2xl">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-400" /> File Details
                    </h3>
                    <div className="space-y-2 font-mono text-xs break-all">
                        <div><span className="text-zinc-500">Source:</span> <span className="text-zinc-100">{image.source_pdf}</span></div>
                        <div><span className="text-zinc-500">Page:</span> {image.page}</div>
                        <div><span className="text-zinc-500">Resolution:</span> {image.width} x {image.height}</div>
                    </div>
                </div>
            )}

            {/* Shortcuts Overlay */}
            {showShortcuts && (
                <div className="absolute bottom-24 right-6 z-50 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-sm text-zinc-400">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">←/→</kbd> <span>Navigate</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">Esc</kbd> <span>Close</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">+/-</kbd> <span>Zoom</span>
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">i</kbd> <span>Info</span>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            {hasPrev && (
                <div className="absolute inset-y-0 left-0 w-16 z-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group">
                    <button
                        onClick={onPrev}
                        className="p-4 bg-black/50 backdrop-blur-md rounded-r-2xl border border-l-0 border-white/10 text-white/50 group-hover:text-white transition-all transform -translate-x-2 group-hover:translate-x-0"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                </div>
            )}

            {hasNext && (
                <div className="absolute inset-y-0 right-0 w-16 z-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group">
                    <button
                        onClick={onNext}
                        className="p-4 bg-black/50 backdrop-blur-md rounded-l-2xl border border-r-0 border-white/10 text-white/50 group-hover:text-white transition-all transform translate-x-2 group-hover:translate-x-0"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
            )}

            {/* Main Image Viewport */}
            <div
                className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden pb-24 pt-16"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div
                    className="relative transition-transform duration-200 ease-out origin-center select-none"
                    style={{
                        width: image.width,
                        maxWidth: '95%',
                        maxHeight: '100%',
                        transform: `scale(${zoom})`,
                        aspectRatio: `${image.width} / ${image.height}`
                    }}
                >
                    {/* Keep next/image here for priority loading of full-res */}
                    <Image
                        src={image.src}
                        alt={`Image ${index + 1}`}
                        fill
                        quality={85}
                        className={`object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setIsLoaded(true)}
                        priority
                        unoptimized // Skip optimization since images are pre-processed
                    />
                </div>
            </div>

            {/* Context Strip - Native img for speed */}
            <div className="absolute bottom-0 inset-x-0 h-20 z-50 flex items-center justify-center gap-2 p-2 bg-gradient-to-t from-black/90 to-transparent overflow-x-auto pointer-events-auto">
                {contextImages.map((img, i) => {
                    const isActive = img.id === image.id;
                    // Calculate absolute index for jump
                    const absoluteIndex = index + (i - currentIndexInContext);

                    return (
                        <button
                            key={img.id}
                            onClick={() => onJumpTo && onJumpTo(absoluteIndex)}
                            className={`relative h-12 w-9 md:h-16 md:w-12 flex-shrink-0 rounded overflow-hidden border transition-all duration-200 ${isActive
                                    ? 'border-white scale-110 shadow-lg z-10'
                                    : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105 hover:border-white/50'
                                }`}
                        >
                            {/* Native img for context strip - max speed */}
                            <img
                                src={img.thumb}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
