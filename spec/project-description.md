# Project: Astro Photo Stream Integration

An open-source Astro.js integration for creating sophisticated photo galleries and streams with AI-powered metadata generation and geolocation features.

**Based on Reference Implementation**: This package extracts and modularizes the photo stream functionality from `/Users/walterra/dev/walterra-dev` (Cactus theme implementation) into a standalone, theme-independent Astro integration that can be used with any Astro site.

## Features

**Based on Proven Reference Implementation:**

- **Content Collections**: Astro-native content collection schema with comprehensive photo metadata
- **EXIF Processing**: Automated extraction of camera settings, GPS, timestamps using exifr
- **AI Metadata Generation**: Claude API integration for intelligent titles, descriptions, and tags
- **Smart Geolocation**: Location name resolution with privacy-focused blur/offset options
- **Interactive Maps**: Single and multi-marker maps with intelligent location consolidation
- **Responsive Grids**: 2/3/4 column layouts with hover effects and lazy loading
- **Pagination**: Theme-independent routing with keyboard navigation
- **SEO & Social**: Dynamic OG images and metadata generation
- **Performance Optimized**: Static generation with image optimization

## Layout Integration

**Theme Compatibility**: The integration now supports layout wrappers for seamless theme integration:

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [
    photoStream({
      layout: {
        enabled: true,
        wrapper: './src/layouts/BaseLayout.astro',
        props: {
          author: 'Your Name',
          siteName: 'My Photo Blog',
        },
      },
    }),
  ],
});
```

This allows photo routes to inherit the consuming project's theme, navigation, and styling.

## Commands

**Note**: Project is in planning phase - no commands currently available. Planned commands:

- **Install**: `npx astro add astro-photostream`
- **Dev**: `pnpm dev`
- **Build CLI**: `pnpm build:cli`
- **Check**: `pnpm check`
- **Test**: `pnpm test`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`

## Visual Testing

**UI Components**: PhotoCard, PhotoGrid, PhotoStream, MultiMarkerMap, MapImage
**Test Server**: http://localhost:4321 (demo site)
**Screenshot Directory**: .playwright-mcp/
**Visual Test Patterns**: Image thumbnails, responsive grids, map displays, navigation elements

## Structure

**Reference Implementation**: `/Users/walterra/dev/walterra-dev` (Cactus theme integration)
**Current**: Early development - extracting proven patterns into standalone package

```
src/
├── components/          # Photo display components (based on reference)
│   ├── PhotoCard.astro      # Individual photo with metadata display
│   ├── PhotoGrid.astro      # 2/3/4 column responsive grid
│   ├── PhotoStream.astro    # Paginated photo stream with year grouping
│   ├── MultiMarkerMap.astro # Multi-location mapping with consolidation
│   └── MapImage.astro       # Single photo location maps
├── routes/              # Route templates for integration injection
│   ├── photos.astro         # Main photo stream page
│   ├── photo.astro          # Individual photo pages
│   └── [...page].astro      # Pagination routes
├── utils/               # Core functionality
│   ├── metadata.ts          # EXIF extraction and AI generation
│   ├── collection.ts        # Content collection utilities
│   └── routing.ts           # Pagination and navigation
└── scripts/             # CLI tools (extracted from reference)
    └── photo-metadata-generator.ts
```

## Technology Stack

- **Framework**: Astro.js (4.x/5.x)
- **Language**: TypeScript (full type safety)
- **Package Manager**: pnpm
- **AI Integration**: Claude API
- **Build Tools**: Standard Astro build pipeline
