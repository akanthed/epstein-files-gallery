export interface ImageMeta {
  id: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  source_pdf: string;
  page: number;
}

export interface GalleryManifest {
  stats: {
    totalImages: number;
    totalZips: number;
  };
  images: ImageMeta[];
}
