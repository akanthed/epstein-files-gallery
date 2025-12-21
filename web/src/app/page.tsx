'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GalleryManifest, ImageMeta } from '@/lib/types';
import { MasonryGrid } from '@/components/MasonryGrid';
import { ImageModal } from '@/components/ImageModal';
import { FlightGlobe } from '@/components/FlightGlobe';
import { Loader2, Files, Globe2 } from 'lucide-react';
import { BASE_PATH } from '@/lib/utils';

const BATCH_SIZE = 40;

type ViewMode = 'archive' | 'globe';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('archive');
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [displayedImages, setDisplayedImages] = useState<ImageMeta[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/processed/images.json`)
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
    if (viewMode !== 'archive') return; // Only observe in archive mode

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
  }, [loadMore, viewMode]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">

      {/* Header & Tabs */}
      <div className="max-w-[1920px] mx-auto mb-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Epstein Files Gallery
            </h1>
            <p className="text-zinc-400 max-w-2xl">
              Official court documents and photos sourced from <a href="https://www.justice.gov/" target="_blank" className="underline hover:text-white transition">U.S. Department of Justice</a>
            </p>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('archive')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'archive' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <Files className="w-4 h-4" />
              The Archive
            </button>
            <button
              onClick={() => setViewMode('globe')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'globe' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <Globe2 className="w-4 h-4" />
              Flight Tracker
            </button>
          </div>
        </header>

        {/* Content Area */}
        {viewMode === 'archive' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 text-sm text-zinc-500 font-mono uppercase tracking-wider">
                  <div>
                    <span className="text-zinc-300">{manifest?.stats.totalImages.toLocaleString()}</span> Images
                  </div>
                  <div>
                    <span className="text-zinc-300">{manifest?.stats.totalZips}</span> Archives
                  </div>
                </div>

                <MasonryGrid
                  images={displayedImages}
                  onImageClick={(img) => {
                    const idx = manifest?.images.findIndex(i => i.id === img.id);
                    if (idx !== undefined && idx !== -1) setSelectedImageIndex(idx);
                  }}
                />

                <div ref={observerTarget} className="h-20 flex justify-center items-center">
                  {displayedImages.length < (manifest?.images.length || 0) && (
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {viewMode === 'globe' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <FlightGlobe />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="font-medium text-white mb-2">About Flight Data</h3>
                <p className="text-sm text-zinc-400">
                  This visualization maps flight logs found in the court documents. Each arc represents a recorded flight. Hover over paths to see passenger details.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Modal */}
      {selectedImageIndex !== null && manifest && (
        <ImageModal
          image={manifest.images[selectedImageIndex]}
          index={selectedImageIndex}
          total={manifest.images.length}
          contextImages={manifest.images.slice(
            Math.max(0, selectedImageIndex - 10),
            Math.min(manifest.images.length, selectedImageIndex + 11)
          )}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() => setSelectedImageIndex(prev => prev !== null && prev < manifest.images.length - 1 ? prev + 1 : prev)}
          onPrev={() => setSelectedImageIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
          onJumpTo={(idx) => setSelectedImageIndex(idx)}
        />
      )}
    </main>
  );
}

