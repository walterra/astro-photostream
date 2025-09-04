import { z } from 'zod';

// Integration options schema with Zod validation
export const integrationOptionsSchema = z
  .object({
    // Core configuration
    enabled: z.boolean().default(true),

    // Photo processing options
    photos: z
      .object({
        directory: z.string().default('src/content/photos'), // Directory for photo markdown (.md) files
        assetsDirectory: z.string().default('src/assets/photos'),
        formats: z
          .array(z.enum(['jpg', 'jpeg', 'png', 'webp', 'avif']))
          .default(['jpg', 'jpeg', 'png', 'webp']),
        maxWidth: z.number().default(1920),
        maxHeight: z.number().default(1080),
        quality: z.number().min(1).max(100).default(85),
      })
      .default({}),

    // AI metadata generation
    ai: z
      .object({
        enabled: z.boolean().default(false),
        provider: z.enum(['claude', 'openai', 'custom']).default('claude'),
        apiKey: z.string().optional(),
        model: z.string().optional(),
        prompt: z.string().optional(),
      })
      .default({}),

    // Geolocation processing
    geolocation: z
      .object({
        enabled: z.boolean().default(true),
        apiKey: z.string().optional(),
        privacy: z
          .object({
            enabled: z.boolean().default(true),
            radius: z.number().default(1000), // meters
            method: z.enum(['blur', 'offset', 'disable']).default('blur'),
          })
          .default({}),
      })
      .default({}),

    // Gallery display options
    gallery: z
      .object({
        itemsPerPage: z.number().default(12),
        gridCols: z
          .object({
            mobile: z.number().default(2),
            tablet: z.number().default(3),
            desktop: z.number().default(4),
          })
          .default({}),
        enableMap: z.boolean().default(true),
        enableTags: z.boolean().default(true),
        enableSearch: z.boolean().default(false),
      })
      .default({}),

    // SEO and social
    seo: z
      .object({
        generateOpenGraph: z.boolean().default(true),
        siteName: z.string().optional(),
        twitterHandle: z.string().optional(),
      })
      .default({}),

    // Layout wrapper integration
    layout: z
      .object({
        enabled: z.boolean().default(false),
        wrapper: z.string().optional(), // Path to layout component
        props: z.record(z.unknown()).default({}), // Props to pass to layout
      })
      .default({}),
  })
  .default({});

export type IntegrationOptions = z.infer<typeof integrationOptionsSchema>;

// Photo metadata types aligned with reference implementation
export interface PhotoMetadata {
  id: string;
  title: string;
  description?: string;
  coverImage: {
    alt: string;
    src: unknown; // ImageMetadata | string
  };
  camera?: string; // Combined make and model
  lens?: string;
  settings?: {
    aperture?: string;
    shutter?: string;
    iso?: string;
    focalLength?: string;
  };
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  };
  tags: string[];
  publishDate: Date;
  draft: boolean;
}

// Component props types
export interface PhotoCardProps {
  photo: PhotoMetadata;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  class?: string;
}

export interface PhotoGridProps {
  photos: PhotoMetadata[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  class?: string;
}

export interface PhotoStreamProps {
  photos: PhotoMetadata[];
  itemsPerPage?: number;
  showPagination?: boolean;
  showMap?: boolean;
  class?: string;
}

export interface MultiMarkerMapProps {
  photos: PhotoMetadata[];
  zoom?: number;
  class?: string;
  hideCaption?: boolean;
}

// Content collection types
export interface PhotoCollectionEntry {
  id: string;
  slug: string;
  body: string;
  collection: 'photos';
  data: PhotoMetadata;
}
