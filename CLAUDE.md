# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Astro integration** called `astro-photo-stream` that creates sophisticated photo galleries with AI-powered metadata generation, geolocation features, and responsive design. It's built as a standalone npm package that users can install via `npx astro add astro-photo-stream`.

## Development Commands

### Core Development
- `pnpm build` - Build the TypeScript source to dist/ directory (required before testing)
- `pnpm dev` - Watch mode TypeScript compilation
- `pnpm check` - Run Astro type checking
- `pnpm lint` - ESLint checking on src/
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run Vitest tests
- `pnpm test:coverage` - Run tests with coverage report

### Demo Site Development  
- `cd demo && pnpm dev` - Run demo site locally (requires main package to be built first)
- `cd demo && pnpm build` - Build demo site for production
- `cd demo && pnpm check` - Check demo site types

### CLI Tool Testing
- `pnpm build` then `node dist/scripts/photo-metadata-generator.js --help` - Test CLI
- `node dist/scripts/photo-metadata-generator.js --generate-config` - Generate example config

## Architecture Overview

### Integration Structure
The project follows Astro integration patterns using `astro-integration-kit`:

- **`src/index.ts`** - Main integration entry point, handles route injection and virtual imports
- **`src/types.ts`** - Zod schemas and TypeScript types for configuration validation
- **`src/schema.ts`** - Astro content collection schema exported for users

### Modular Processing Classes
The metadata generation system uses a class-based architecture:

- **`ExifProcessor`** - Extracts camera metadata (settings, GPS, dates) using exifr
- **`LLMAnalyzer`** (abstract) - Base class for AI content analysis
  - **`ClaudeAnalyzer`** - Concrete implementation for Anthropic Claude API
- **`GeocodeProcessor`** - Reverse geocoding using OpenCage API with privacy features
- **`PhotoMetadataGenerator`** - Orchestrates all processors together

### Component System
Astro components in `src/components/`:
- **`PhotoGrid`** - Responsive photo gallery grid (2/3/4 columns)
- **`PhotoCard`** - Individual photo display with metadata
- **`PhotoStream`** - Paginated photo stream with year grouping
- **`MultiMarkerMap`** - Interactive maps using Leaflet with location clustering
- **`Paginator`** - Reusable pagination component

### Route Templates
Pre-built page templates in `src/routes/`:
- **`photos/[...page].astro`** - Main gallery with pagination (`/photos`, `/photos/2`)
- **`photos/[slug].astro`** - Individual photo pages with navigation
- **`photos/tags/[tag]/[...page].astro`** - Tag-based filtering with pagination
- **`og-image.ts`** - Dynamic OpenGraph image generation endpoint

### Configuration System
Multi-layered configuration loading in `src/utils/config.ts`:
1. Default values (in types.ts)
2. Config file (`astro-photo-stream.config.js`)
3. Environment variables
4. Integration options passed to defineConfig

### CLI Tool Architecture
The CLI (`src/scripts/photo-metadata-generator.ts`) uses the same modular classes as the integration:
- Supports batch processing, EXIF-only updates, location-only updates
- Memory system to avoid repetitive AI-generated content
- Progressive image compression for API upload limits
- Handles both new generation and existing file updates

## Key Implementation Details

### EXIF Data Processing
Uses `exifr` library with specific field extraction for:
- Camera/lens information
- Exposure settings (aperture, shutter, ISO, focal length)  
- GPS coordinates with privacy-aware location resolution
- Date/time metadata with timezone handling

### AI Integration
- Supports Claude API with configurable prompts and models
- Image compression pipeline to stay under API limits (~3.7MB target)
- Memory system tracks recent outputs to avoid repetitive content
- Graceful fallback to filename-based metadata when AI unavailable

### Privacy & Geolocation
- OpenCage API integration for location name resolution
- Privacy-first approach with configurable blur radius and offset
- Intelligent location specificity scoring (landmarks > cities > countries)
- No street-level addresses for privacy protection

### Build & Distribution
- TypeScript compilation with `tsc-alias` for path resolution
- Exports multiple entry points: main, components, schema, utils
- CLI tools published as bin commands
- Demo site included for testing and showcasing features

## Environment Variables

Required for full functionality:
- `ANTHROPIC_API_KEY` - Claude API access for AI metadata generation
- `OPENCAGE_API_KEY` - Location name resolution from GPS coordinates
- `GEOAPIFY_API_KEY` - Static map generation (optional)

## Demo Site

The `demo/` directory contains a working Astro site that showcases the integration:
- Uses Tailwind CSS for styling
- Can run independently with basic photo gallery functionality
- Temporarily disables integration during development (until package is built)
- Includes sample photo content with realistic metadata