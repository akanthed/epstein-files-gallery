'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GalleryManifest, ImageMeta, FilterType } from '@/lib/types';
import { MasonryGrid } from '@/components/MasonryGrid';
import { ImageModal } from '@/components/ImageModal';
import { FlightGlobe } from '@/components/FlightGlobe';
import { Loader2, Files, Globe2, Users, FileText, UsersRound, Image, Sparkles } from 'lucide-react';
import { BASE_PATH } from '@/lib/utils';

const BATCH_SIZE = 40;

type ViewMode = 'archive' | 'globe';

// Filter configuration
const FILTERS: { type: FilterType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'all', label: 'All', icon: <Image className="w-4 h-4" />, description: 'Show all images' },
  { type: 'people', label: 'People', icon: <Users className="w-4 h-4" />, description: 'Images with faces' },
  { type: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" />, description: 'Images with text' },
  { type: 'group', label: 'Groups', icon: <UsersRound className="w-4 h-4" />, description: '3+ people' },
  { type: 'high-res', label: 'High-Res', icon: <Sparkles className="w-4 h-4" />, description: 'Detailed images' },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('archive');
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/processed/images.json`)
      .then(res => res.json())
      .then((data: GalleryManifest) => {
        setManifest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load manifest", err);
        setLoading(false);
      });
  }, []);

  // Filter images based on AI metadata
  const filteredImages = useMemo(() => {
    if (!manifest) return [];

    const images = manifest.images;

    if (activeFilter === 'all') return images;

    return images.filter(img => {
      const ai = img.ai;
      if (!ai) return false; // No AI data = excluded from filters

      switch (activeFilter) {
        case 'people':
          return ai.faces > 0;
        case 'documents':
          return ai.has_text;
        case 'group':
          return ai.faces >= 3;
        case 'high-res':
          return ai.tags?.includes('high-res') || ai.tags?.includes('detailed');
        case 'grayscale':
          return ai.tags?.includes('grayscale');
        default:
          return true;
      }
    });
  }, [manifest, activeFilter]);

  // Displayed images (paginated)
  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, displayCount);
  }, [filteredImages, displayCount]);

  const loadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + BATCH_SIZE, filteredImages.length));
  }, [filteredImages.length]);

  // Reset pagination when filter changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE);
  }, [activeFilter]);

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
                {/* Stats Row */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4 text-sm text-zinc-500 font-mono uppercase tracking-wider">
                  <div className="flex gap-4">
                    <div>
                      <span className="text-zinc-300">{filteredImages.length.toLocaleString()}</span>
                      {activeFilter !== 'all' && <span className="text-zinc-500"> / {manifest?.stats.totalImages.toLocaleString()}</span>}
                      {' '}Images
                    </div>
                    <div>
                      <span className="text-zinc-300">{manifest?.stats.totalZips}</span> Archives
                    </div>
                  </div>

                  {/* AI Stats Badge (if available) */}
                  {manifest?.ai_stats && (
                    <div className="flex items-center gap-2 text-xs normal-case tracking-normal">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        🤖 AI Analyzed
                      </span>
                      <span className="text-zinc-500">
                        {manifest.ai_stats.images_with_faces} with faces • {manifest.ai_stats.images_with_text} with text
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {FILTERS.map(filter => {
                    // Count for this filter
                    let count = 0;
                    if (filter.type === 'all') {
                      count = manifest?.stats.totalImages || 0;
                    } else if (manifest?.ai_stats) {
                      // Use AI stats for quick counts
                      switch (filter.type) {
                        case 'people':
                          count = manifest.ai_stats.images_with_faces;
                          break;
                        case 'documents':
                          count = manifest.ai_stats.images_with_text;
                          break;
                        default:
                          count = manifest.ai_stats.tag_distribution?.[filter.type] || 0;
                      }
                    }

                    const isActive = activeFilter === filter.type;
                    const hasData = filter.type === 'all' || count > 0;

                    return (
                      <button
                        key={filter.type}
                        onClick={() => setActiveFilter(filter.type)}
                        disabled={!hasData}
                        title={filter.description}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isActive
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                            : hasData
                              ? 'bg-zinc-800/50 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-white'
                              : 'bg-zinc-900/50 text-zinc-600 border border-white/5 cursor-not-allowed opacity-50'
                          }
                        `}
                      >
                        {filter.icon}
                        {filter.label}
                        {hasData && filter.type !== 'all' && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                            {count.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <MasonryGrid
                  images={displayedImages}
                  onImageClick={(img) => {
                    // Find in filtered images for correct context
                    const idx = filteredImages.findIndex(i => i.id === img.id);
                    if (idx !== -1) setSelectedImageIndex(idx);
                  }}
                />

                <div ref={observerTarget} className="h-20 flex justify-center items-center">
                  {displayedImages.length < filteredImages.length && (
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
      {selectedImageIndex !== null && filteredImages.length > 0 && (
        <ImageModal
          image={filteredImages[selectedImageIndex]}
          index={selectedImageIndex}
          total={filteredImages.length}
          contextImages={filteredImages.slice(
            Math.max(0, selectedImageIndex - 10),
            Math.min(filteredImages.length, selectedImageIndex + 11)
          )}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() => setSelectedImageIndex(prev => prev !== null && prev < filteredImages.length - 1 ? prev + 1 : prev)}
          onPrev={() => setSelectedImageIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
          onJumpTo={(idx) => setSelectedImageIndex(idx)}
        />
      )}
    </main>
  );
}

