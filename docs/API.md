# 📚 API Documentation

Complete reference for the **astro-photostream** integration API, including TypeScript types, configuration options, components, and utilities.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [TypeScript Types](#typescript-types)
- [Components](#components)
- [Utilities](#utilities)
- [CLI Tools](#cli-tools)
- [Hooks & Events](#hooks--events)

## Installation

### Basic Installation

```bash
npx astro add astro-photostream
```

### Manual Installation

```bash
npm install astro-photostream
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photostream';

export default defineConfig({
  integrations: [photoStream()],
});
```

## Configuration

### Integration Options

```ts
interface IntegrationOptions {
  enabled?: boolean;
  photos?: PhotoOptions;
  ai?: AIOptions;
  geolocation?: GeolocationOptions;
  gallery?: GalleryOptions;
  seo?: SEOOptions;
}
```

### PhotoOptions

```ts
interface PhotoOptions {
  /** Directory containing photo content */
  directory?: string; // default: 'src/content/photos'

  /** Supported image formats */
  formats?: Array<'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'>; // default: ['jpg', 'jpeg', 'png', 'webp']

  /** Maximum image width for optimization */
  maxWidth?: number; // default: 1920

  /** Maximum image height for optimization */
  maxHeight?: number; // default: 1080

  /** Image quality (1-100) */
  quality?: number; // default: 85
}
```

### AIOptions

```ts
interface AIOptions {
  /** Enable AI metadata generation */
  enabled?: boolean; // default: false

  /** AI provider to use */
  provider?: 'claude' | 'openai' | 'custom'; // default: 'claude'

  /** API key for the chosen provider */
  apiKey?: string;

  /** Model to use for generation */
  model?: string;

  /** Custom prompt template */
  prompt?: string;
}
```

### GeolocationOptions

```ts
interface GeolocationOptions {
  /** Enable geolocation processing */
  enabled?: boolean; // default: true

  /** Privacy protection settings */
  privacy?: {
    /** Enable privacy protection */
    enabled?: boolean; // default: true

    /** Blur radius in meters */
    radius?: number; // default: 1000

    /** Privacy method */
    method?: 'blur' | 'offset' | 'disable'; // default: 'blur'
  };
}
```

### GalleryOptions

```ts
interface GalleryOptions {
  /** Number of photos per page */
  itemsPerPage?: number; // default: 20

  /** Grid column configuration */
  gridCols?: {
    mobile?: number; // default: 2
    tablet?: number; // default: 3
    desktop?: number; // default: 4
  };

  /** Enable map display */
  enableMap?: boolean; // default: true

  /** Enable tag-based filtering */
  enableTags?: boolean; // default: true

  /** Enable search functionality */
  enableSearch?: boolean; // default: false
}
```

### SEOOptions

```ts
interface SEOOptions {
  /** Generate OpenGraph images */
  generateOpenGraph?: boolean; // default: true

  /** Site name for metadata */
  siteName?: string;

  /** Twitter handle for metadata */
  twitterHandle?: string;
}
```

## TypeScript Types

### Core Photo Types

```ts
interface PhotoMetadata {
  /** Unique identifier */
  id: string;

  /** Photo title */
  title: string;

  /** Optional description */
  description?: string;

  /** Cover image configuration */
  coverImage: {
    alt: string;
    src: any; // ImageMetadata | string
  };

  /** Camera information */
  camera?: string;

  /** Lens information */
  lens?: string;

  /** Camera settings */
  settings?: CameraSettings;

  /** Location data */
  location?: LocationData;

  /** Photo tags */
  tags: string[];

  /** Publication date */
  publishDate: Date;

  /** Draft status */
  draft: boolean;
}

interface CameraSettings {
  aperture?: string; // e.g., "f/2.8"
  shutter?: string; // e.g., "1/250s"
  iso?: string; // e.g., "ISO 100"
  focalLength?: string; // e.g., "85mm"
}

interface LocationData {
  name?: string;
  latitude?: number;
  longitude?: number;
}
```

### Component Props

```ts
interface PhotoCardProps {
  photo: PhotoMetadata;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  class?: string;
}

interface PhotoGridProps {
  photos: PhotoMetadata[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  class?: string;
}

interface PhotoStreamProps {
  photos: PhotoMetadata[];
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  baseUrl?: string;
}

interface MultiMarkerMapProps {
  photos: PhotoMetadata[];
  height?: string;
  consolidationRadius?: number;
  class?: string;
}

interface MapImageProps {
  photo: PhotoMetadata;
  width?: number;
  height?: number;
  zoom?: number;
  class?: string;
}
```

### Utility Types

```ts
interface PhotoStatistics {
  totalPhotos: number;
  publishedPhotos: number;
  draftPhotos: number;
  totalTags: number;
  locationsWithPhotos: number;
  averagePhotosPerMonth: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
}

interface FeaturedLocation {
  name: string;
  latitude: number;
  longitude: number;
  photoCount: number;
  photos: PhotoMetadata[];
}

interface MetadataGenerationOptions {
  ai?: AIOptions;
  geolocation?: GeolocationOptions;
  overwrite?: boolean;
  batchSize?: number;
}
```

## Components

### PhotoCard

Display a single photo with metadata.

```astro
---
import { PhotoCard } from 'astro-photostream/components';
---

<PhotoCard
  photo={photo}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
  class="custom-photo-card"
/>
```

**Props:**

- `photo` (required): PhotoMetadata object
- `loading`: Image loading strategy
- `sizes`: Responsive image sizes
- `class`: Additional CSS classes

### PhotoGrid

Display a responsive grid of photos.

```astro
---
import { PhotoGrid } from 'astro-photostream/components';
---

<PhotoGrid
  photos={photos}
  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
  class="my-photo-grid"
/>
```

**Props:**

- `photos` (required): Array of PhotoMetadata objects
- `columns`: Grid column configuration
- `class`: Additional CSS classes

### PhotoStream

Full photo stream with pagination.

```astro
---
import { PhotoStream } from 'astro-photostream/components';
---

<PhotoStream
  photos={photos}
  currentPage={1}
  totalPages={5}
  itemsPerPage={20}
  baseUrl="/photos"
/>
```

**Props:**

- `photos` (required): Array of PhotoMetadata objects
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `itemsPerPage`: Photos per page
- `baseUrl`: Base URL for pagination

### MultiMarkerMap

Interactive map with multiple photo locations.

```astro
---
import { MultiMarkerMap } from 'astro-photostream/components';
---

<MultiMarkerMap
  photos={photosWithLocation}
  consolidationRadius={5000}
  class="photo-map"
/>
```

**Props:**

- `photos` (required): Array of PhotoMetadata objects with location data
- `height`: Map container height
- `consolidationRadius`: Distance in meters for grouping nearby photos
- `class`: Additional CSS classes

### MapImage

Static map image for a single photo location.

```astro
---
import { MapImage } from 'astro-photostream/components';
---

<MapImage
  photo={photo}
  width={300}
  height={200}
  zoom={12}
  class="location-map"
/>
```

**Props:**

- `photo` (required): PhotoMetadata object with location data
- `width`: Map image width
- `height`: Map image height
- `zoom`: Map zoom level
- `class`: Additional CSS classes

## Utilities

### Photo Data Processing

```ts
import {
  getAllPhotos,
  getPhotosByTag,
  getFeaturedLocations,
  getPhotoStatistics,
} from 'astro-photostream/utils';

// Get all published photos
const photos: PhotoMetadata[] = await getAllPhotos();

// Get photos by specific tag
const landscapePhotos: PhotoMetadata[] = await getPhotosByTag('landscape');

// Get featured locations with photo counts
const locations: FeaturedLocation[] = await getFeaturedLocations();

// Get comprehensive statistics
const stats: PhotoStatistics = await getPhotoStatistics();
```

### Metadata Generation

```ts
import { generatePhotoMetadata } from 'astro-photostream/utils';

const metadata = await generatePhotoMetadata('/path/to/photo.jpg', {
  ai: {
    enabled: true,
    provider: 'claude',
    apiKey: 'your-api-key',
  },
  geolocation: {
    enabled: true,
    privacy: { enabled: true, radius: 1000 },
  },
});
```

### Collection Utilities

```ts
import {
  processPhotoCollection,
  validatePhotoMetadata,
  sortPhotosByDate,
} from 'astro-photostream/utils';

// Process and validate entire photo collection
const processedPhotos = await processPhotoCollection();

// Validate individual photo metadata
const isValid = validatePhotoMetadata(photoData);

// Sort photos by publication date
const sortedPhotos = sortPhotosByDate(photos, 'desc');
```

## CLI Tools

### Main Command

```bash
# Generate metadata for all photos
npx astro-photostream

# Alias
npx photo-metadata-generator
```

### CLI Options

```bash
# AI metadata only
npx astro-photostream --ai

# Location data only
npx astro-photostream --location

# EXIF data only
npx astro-photostream --update-exif

# Generate config file
npx astro-photostream --generate-config

# Batch processing with progress
npx astro-photostream --batch --progress

# Overwrite existing metadata
npx astro-photostream --overwrite

# Process specific directory
npx astro-photostream --dir ./custom-photos

# Verbose output
npx astro-photostream --verbose

# Help
npx astro-photostream --help
```

### Configuration File

Create `astro-photostream.config.js`:

```js
export default {
  ai: {
    enabled: true,
    provider: 'claude',
    model: 'claude-3-sonnet-20240229',
    prompt: 'Custom prompt template...',
  },
  geolocation: {
    enabled: true,
    privacy: {
      enabled: true,
      radius: 2000,
      method: 'blur',
    },
  },
  photos: {
    directory: 'src/content/photos',
    quality: 90,
  },
};
```

## Hooks & Events

### Astro Integration Hooks

The integration uses Astro's official hooks:

```ts
// astro:config:setup
// - Injects routes
// - Adds virtual imports
// - Configures Vite plugins

// astro:config:done
// - Validates configuration
// - Logs setup information

// astro:build:start
// - Processes photos for build
// - Generates metadata

// astro:build:done
// - Finalizes photo processing
// - Reports build completion
```

### Custom Events

```ts
// Available in development mode
document.addEventListener('astro-photostream:ready', event => {
  console.log('Photo stream initialized');
});

document.addEventListener('astro-photostream:metadata-generated', event => {
  console.log('Metadata generated for:', event.detail.photoPath);
});
```

## Error Handling

### Common Error Types

```ts
interface PhotoStreamError {
  code: string;
  message: string;
  context?: any;
}

// Error codes:
// - INVALID_CONFIG: Configuration validation failed
// - MISSING_API_KEY: AI provider API key not found
// - PHOTO_NOT_FOUND: Specified photo file doesn't exist
// - METADATA_GENERATION_FAILED: AI metadata generation failed
// - EXIF_PROCESSING_ERROR: EXIF data extraction failed
// - GEOLOCATION_ERROR: Location resolution failed
```

### Error Handling Examples

```ts
try {
  const metadata = await generatePhotoMetadata(photoPath, options);
} catch (error) {
  if (error.code === 'MISSING_API_KEY') {
    console.log('AI features disabled: No API key provided');
  } else {
    console.error('Metadata generation failed:', error.message);
  }
}
```

## Migration Guide

### From v0.1.x to v0.2.x

- Configuration structure remains backward compatible
- New optional features can be enabled gradually
- CLI commands maintain same interface

### Breaking Changes

Currently none - all changes are additive and backward compatible.

## Performance Considerations

### Image Optimization

- Images are automatically optimized during build
- Responsive images generated for different screen sizes
- Lazy loading enabled by default
- WebP/AVIF format support for modern browsers

### Build Time

- Metadata generation runs in parallel for better performance
- EXIF processing is cached to avoid re-processing
- AI metadata generation respects rate limits
- Large photo collections are processed in batches

### Runtime Performance

- All pages are statically generated
- Minimal JavaScript for interactive features
- Images loaded progressively with intersection observer
- Maps rendered as static images by default

## Support

- 📖 [Documentation](https://github.com/walterra/astro-photostream#readme)
- 🐛 [Issue Tracker](https://github.com/walterra/astro-photostream/issues)
- 💬 [Astro Discord](https://astro.build/chat)
- 📧 [Email Support](mailto:support@example.com)

---

**📸 Happy photo streaming with Astro!**
