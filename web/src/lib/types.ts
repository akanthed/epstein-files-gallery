// AI-generated metadata for each image
export interface AIMetadata {
  faces: number;           // Number of faces detected
  has_text: boolean;       // Whether text was detected
  text_confidence: number; // OCR confidence (0-1)
  text_sample: string;     // Sample of detected text
  tags: string[];          // Scene classification tags
}

export interface ImageMeta {
  id: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  source_pdf: string;
  page: number;
  ai?: AIMetadata;  // Optional AI analysis data
}

export interface AIStats {
  images_with_faces: number;
  images_with_text: number;
  total_faces_detected: number;
  tag_distribution: Record<string, number>;
}

export interface GalleryManifest {
  stats: {
    totalImages: number;
    totalZips: number;
  };
  images: ImageMeta[];
  ai_stats?: AIStats;  // Optional AI statistics
}

// Filter options for the gallery
export type FilterType =
  | 'all'
  | 'people'
  | 'documents'
  | 'group'
  | 'high-res'
  | 'grayscale';
