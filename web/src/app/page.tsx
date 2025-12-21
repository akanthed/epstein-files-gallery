'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GalleryManifest, ImageMeta } from '@/lib/types';
import { MasonryGrid } from '@/components/MasonryGrid';
import { ImageModal } from '@/components/ImageModal';
import { Loader2 } from 'lucide-react';

const BATCH_SIZE = 40;

export default function Home() {
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [displayedImages, setDisplayedImages] = useState<ImageMeta[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/processed/images.json')
      .then(res => res.json())
      .then((data: GalleryManifest) => {
        setManifest(data);
        setDisplayedImages(data.images.slice(0, BATCH_SIZE));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load manifest", err);
        setLoading(false);
      });
  }, []);

  const loadMore = useCallback(() => {
    if (!manifest) return;

    setDisplayedImages(prev => {
      const currentCount = prev.length;
      if (currentCount >= manifest.images.length) return prev;
      return [
        ...prev,
        ...manifest.images.slice(currentCount, currentCount + BATCH_SIZE)
      ];
    });
  }, [manifest]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const handleImageClick = (image: ImageMeta) => {
    if (!manifest) return;
    const index = manifest.images.findIndex(img => img.id === image.id);
    setSelectedImageIndex(index);
  };

  const selectedImage = selectedImageIndex !== null && manifest
    ? manifest.images[selectedImageIndex]
    : null;

  const handleNext = () => {
    if (selectedImageIndex !== null && manifest && selectedImageIndex < manifest.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  if (loading && !manifest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8 md:px-8">
      <header className="mb-8 md:mb-12 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-light text-zinc-900 dark:text-zinc-50 mb-2 tracking-tight">
          Document Gallery
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Images sourced from <a href="https://www.justice.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 underline transition-colors">justice.gov</a>
        </p>
        {manifest && (
          <div className="flex gap-6 text-sm text-zinc-500 font-mono border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="flex flex-col">
              <span className="uppercase tracking-wider text-[10px] text-zinc-400">Total Images</span>
              <span>{manifest.stats.totalImages.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase tracking-wider text-[10px] text-zinc-400">Sources</span>
              <span>{manifest.stats.totalZips} Archives</span>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-[1920px] mx-auto min-h-screen">
        <MasonryGrid images={displayedImages} onImageClick={handleImageClick} />

        <div ref={observerTarget} className="h-32 flex items-center justify-center w-full mt-12">
          {manifest && displayedImages.length < manifest.images.length && (
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          )}
        </div>
      </div>

      <ImageModal
        image={selectedImage}
        index={selectedImageIndex ?? 0}
        total={manifest?.images.length ?? 0}
        contextImages={
          manifest && selectedImageIndex !== null
            ? manifest.images.slice(
              Math.max(0, selectedImageIndex - 10),
              Math.min(manifest.images.length, selectedImageIndex + 11)
            )
            : []
        }
        onClose={() => setSelectedImageIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        onJumpTo={(idx) => setSelectedImageIndex(idx)}
      />
    </main>
  );
}
