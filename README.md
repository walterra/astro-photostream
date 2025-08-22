# 📸 Astro Photo Stream

[![npm version](https://badge.fury.io/js/astro-photo-stream.svg)](https://badge.fury.io/js/astro-photo-stream)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

An **Astro integration** for creating sophisticated photo galleries and streams with **AI-powered metadata generation**, **geolocation features**, and **responsive design**. Transform your photos into beautiful, SEO-optimized galleries with minimal configuration.

## ✨ Features

🤖 **AI-Powered Metadata** - Automatic titles, descriptions, and tags using Claude/OpenAI  
📍 **Smart Geolocation** - Location name resolution with privacy-focused blur/offset options  
🗺️ **Static Maps** - Single and multi-marker maps with intelligent location consolidation  
📱 **Responsive Design** - 2/3/4 column layouts that work perfectly on all devices  
🔍 **SEO Optimized** - Dynamic OpenGraph images and structured data  
⚡ **Performance First** - Static generation with lazy loading and image optimization  
🏷️ **Tag System** - Automatic tag-based filtering and navigation  
📄 **Pagination** - Built-in pagination with keyboard navigation  
📊 **EXIF Processing** - Comprehensive camera metadata extraction  
🎨 **Theme Independent** - Works with any Astro theme or site

## 🚀 Quick Start

### Installation

```bash
# Using npm
npx astro add astro-photo-stream

# Using pnpm  
pnpm astro add astro-photo-stream

# Using yarn
yarn astro add astro-photo-stream
```

### Basic Setup

1. **Add the integration to your `astro.config.mjs`:**

```js
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      // Zero-config setup works out of the box!
    })
  ]
});
```

2. **Create your photo content collection** (`src/content/config.ts`):

```ts
import { defineCollection } from 'astro:content';
import { photoSchema } from 'astro-photo-stream/schema';

const photos = defineCollection({
  type: 'content',
  schema: photoSchema
});

export const collections = { photos };
```

3. **Add photos to `src/content/photos/`:**

```
src/content/photos/
├── sunset-beach.md
├── sunset-beach.jpg
├── mountain-hike.md
└── mountain-hike.jpg
```

4. **Create photo entries** (`src/content/photos/sunset-beach.md`):

```markdown
---
title: "Golden Hour at the Beach"
description: "Stunning sunset over the Pacific Ocean"
coverImage:
  src: "./sunset-beach.jpg"
  alt: "Golden sunset over ocean waves"
tags: ["sunset", "beach", "golden-hour"]
publishDate: 2024-08-15
location:
  name: "Malibu Beach, California"
  latitude: 34.0259
  longitude: -118.7798
---

A perfect evening capturing the golden hour at Malibu Beach.
```

5. **Your photo gallery is ready!** Visit `/photos` on your site.

## 🛠️ Advanced Configuration

### Complete Configuration Example

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      // Photo processing
      photos: {
        directory: 'src/content/photos',
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85
      },
      
      // AI metadata generation
      ai: {
        enabled: true,
        provider: 'claude', // 'claude' | 'openai' | 'custom'
        apiKey: process.env.CLAUDE_API_KEY,
        model: 'claude-3-sonnet-20240229',
        prompt: 'Analyze this photo and suggest a title and description...'
      },
      
      // Geolocation with privacy
      geolocation: {
        enabled: true,
        privacy: {
          enabled: true,
          radius: 1000, // meters
          method: 'blur' // 'blur' | 'offset' | 'disable'
        }
      },
      
      // Gallery display
      gallery: {
        itemsPerPage: 20,
        gridCols: {
          mobile: 2,
          tablet: 3,
          desktop: 4
        },
        enableMap: true,
        enableTags: true,
        enableSearch: false
      },
      
      // SEO optimization
      seo: {
        generateOpenGraph: true,
        siteName: 'My Photo Gallery',
        twitterHandle: '@yourhandle'
      }
    })
  ]
});
```

### Environment Variables

```bash
# .env
CLAUDE_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
OPENCAGE_API_KEY=your-opencage-key
```

### Configuration File

Create `astro-photo-stream.config.js` for advanced configuration:

```js
export default {
  ai: {
    enabled: true,
    provider: 'claude',
    model: 'claude-3-sonnet-20240229',
    prompt: `Analyze this photo professionally. Provide:
- A compelling, descriptive title (under 60 chars)
- A detailed description (2-3 sentences)
- 3-5 relevant tags`
  },
  geolocation: {
    enabled: true,
    privacy: {
      enabled: true,
      radius: 2000,
      method: 'blur'
    }
  }
};
```

## 📋 CLI Commands

The package includes powerful CLI tools for metadata generation:

### Generate Metadata for All Photos

```bash
# Using npx
npx astro-photo-stream

# Using the full command
npx photo-metadata-generator

# With options
npx astro-photo-stream --ai --location --update-exif
```

### CLI Options

```bash
# Generate AI metadata only
npx astro-photo-stream --ai

# Update location information only  
npx astro-photo-stream --location

# Update EXIF data only
npx astro-photo-stream --update-exif

# Generate configuration file
npx astro-photo-stream --generate-config

# Batch process with progress
npx astro-photo-stream --batch --progress

# Help
npx astro-photo-stream --help
```

## 🧩 Components

Import and use components directly in your Astro pages:

### PhotoGrid

```astro
---
import { PhotoGrid } from 'astro-photo-stream/components';
import { getCollection } from 'astro:content';

const photos = await getCollection('photos');
---

<PhotoGrid 
  photos={photos} 
  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
  class="my-custom-grid"
/>
```

### PhotoCard

```astro
---
import { PhotoCard } from 'astro-photo-stream/components';
---

<PhotoCard 
  photo={photo} 
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### MultiMarkerMap

```astro
---
import { MultiMarkerMap } from 'astro-photo-stream/components';
---

<MultiMarkerMap 
  photos={photosWithLocation}
  height="400px"
  consolidationRadius={5000}
/>
```

## 🗺️ Routing

The integration automatically creates these routes:

- `/photos` - Main photo gallery (paginated)
- `/photos/2`, `/photos/3`, etc. - Pagination
- `/photos/[slug]` - Individual photo pages
- `/photos/tags/[tag]` - Tag-based filtering
- `/photos/tags/[tag]/2` - Tag pagination
- `/api/og/photo/[slug].png` - Dynamic OG images

## 🔧 Utilities

### Photo Data Processing

```ts
import { 
  getAllPhotos, 
  getPhotosByTag, 
  getFeaturedLocations,
  getPhotoStatistics 
} from 'astro-photo-stream/utils';

// Get all published photos
const photos = await getAllPhotos();

// Filter by tag
const landscapePhotos = await getPhotosByTag('landscape');

// Get location data for maps
const locations = await getFeaturedLocations();

// Get statistics
const stats = await getPhotoStatistics();
```

### Metadata Generation

```ts
import { generatePhotoMetadata } from 'astro-photo-stream/utils';

const metadata = await generatePhotoMetadata('/path/to/photo.jpg', {
  ai: { enabled: true, provider: 'claude' },
  geolocation: { enabled: true }
});
```

## 📱 Mobile Support

- **Responsive Design**: Automatically adapts to all screen sizes
- **Touch Navigation**: Swipe gestures for photo browsing
- **Performance**: Optimized loading and lazy loading for mobile
- **Accessibility**: Full keyboard and screen reader support

## 🎨 Styling

The components use minimal CSS classes that you can easily override:

```css
/* Custom styling */
.photo-grid {
  gap: 2rem;
}

.photo-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.photo-card:hover {
  transform: translateY(-4px);
  transition: transform 0.2s ease;
}
```

## 📊 Photo Schema

The content collection schema includes:

```ts
{
  title: string;           // Photo title
  description?: string;    // Optional description
  coverImage: {           // Image configuration
    src: string;          // Path to image file
    alt: string;          // Alt text for accessibility
  };
  camera?: string;        // Camera make/model
  lens?: string;          // Lens information
  settings?: {            // Camera settings
    aperture?: string;    // f/2.8
    shutter?: string;     // 1/250s
    iso?: string;         // ISO 100
    focalLength?: string; // 85mm
  };
  location?: {            // GPS location
    name?: string;        // Location name
    latitude?: number;    // GPS coordinates
    longitude?: number;
  };
  tags: string[];         // Photo tags
  publishDate: Date;      // Publication date
  draft: boolean;         // Draft status
}
```

## 🔒 Privacy & Security

- **Location Privacy**: Configurable blur radius and offset for GPS coordinates
- **API Key Security**: Environment variable configuration
- **EXIF Stripping**: Optional removal of sensitive metadata
- **Content Security**: Safe handling of user-generated content

## 🚀 Performance

- **Static Generation**: All pages are statically generated at build time
- **Image Optimization**: Automatic image optimization and responsive images
- **Lazy Loading**: Images load only when needed
- **Code Splitting**: Minimal JavaScript bundle sizes
- **CDN Ready**: Perfect for deployment to any CDN or static host

## 🔧 Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/walterra/astro-photostream.git
cd astro-photostream

# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Link for local testing
pnpm link --global
```

### Testing in Another Project

```bash
# In your Astro project
pnpm link --global astro-photo-stream
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/) and [astro-integration-kit](https://github.com/florian-lefebvre/astro-integration-kit)
- EXIF processing powered by [exifr](https://github.com/MikeKovarik/exifr)
- Image optimization using [Sharp](https://sharp.pixelplumbing.com/)
- AI integration with [Anthropic Claude](https://www.anthropic.com/) and [OpenAI](https://openai.com/)

---

## 📚 Examples & Resources

- [📖 Documentation](https://github.com/walterra/astro-photostream/wiki)
- [🎯 Demo Site](https://astro-photostream-demo.vercel.app/)
- [🎥 Video Tutorial](https://youtube.com/watch?v=example)
- [💬 Discord Community](https://astro.build/chat)
- [🐛 Report Issues](https://github.com/walterra/astro-photostream/issues)

**Star ⭐ this repo if you find it useful!**