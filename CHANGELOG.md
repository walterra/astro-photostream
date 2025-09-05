# Changelog

## 0.3.7

### Patch Changes

- bd3814c: fix(components): remove double main tag nesting in layout wrapper mode
- bef4190: fix(components): eliminate responsive grid dead zones at tablet breakpoints
- 01353f4: refactor(components): remove Related Photos section from photo detail pages

## 0.3.6

### Patch Changes

- 78cf422: fix(components): align MultiMarkerMap and PhotoStream horizontal padding
- 78cf422: refactor(components): convert all components to use aps- CSS framework
- 78cf422: refactor(components): add aps-content-container class for layout wrapper usage
- 78cf422: style(components): tighten spacing and padding for gallery components

## 0.3.5

### Patch Changes

- e74496c: refactor(components): consolidate route duplication for photo galleries
- e74496c: fix: remove duplicate page numbers in pagination on first photo index page
- e74496c: fix(components): remove redundant page info from gallery headers
- e74496c: fix(cli): resolve GPS extraction and geocoding issues in photo metadata generator
- e74496c: refactor(components): remove PhotoStream header and cleanup console logs
- e74496c: fix(components): move map caption outside shadow container
- e74496c: fix(components): resolve MultiMarkerMap static map rendering issues
- e74496c: fix(cli): preserve nested directory structure in coverImage.src paths
- e74496c: fix(components): improve static map generation with higher resolution and proper styling
- e74496c: fix(utils): add tag sanitization to metadata generation
- e74496c: improve(components): enhance MultiMarkerMap visual quality and consistency
- e74496c: refactor(components): consolidate route duplication by extracting reusable components and utilities
- e74496c: fix(components): remove redundant location headers and counts from gallery pages
- e74496c: style(components): tighten spacing and padding for gallery components

## 0.3.4

### Patch Changes

- b45327c: fix(components): correct MapImage component prop structure for individual photo pages (#11)

## 0.3.3

### Patch Changes

- bb95082: fix(integration): resolve route conflicts with dynamic getStaticPaths

## 0.3.2

### Patch Changes

- 13bf11c: fix(integration): correct route injection order for pagination

## 0.3.1

### Patch Changes

- e29cf3e: fix(cli): correct build output path for CLI binaries.
- 0545ae6: refactor(integration): replace dynamic layout wrapper imports with virtual imports.

## 0.3.0

### Minor Changes

- 3e069c2: Add layout wrapper integration for theme compatibility

  This release introduces layout wrapper support, allowing the astro-photostream integration to seamlessly work with existing Astro themes and layouts.

  **New Features:**
  - Layout wrapper configuration in integration options
  - Consuming projects can now provide their own layout components for photo routes
  - Custom props can be passed to layout wrappers
  - Content-only route templates that render within provided layouts
  - Graceful fallback to minimal HTML structure when no layout is provided

  **Configuration:**

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

- a198892: Add Creative Commons photo fetch script for demo

  Implements a new demo script that downloads high-quality Creative Commons photos from Wikimedia Commons with GPS coordinates for testing the photo stream integration features.

  **Demo Script Features:**
  - Fetches ~20 professional photos from Wikimedia Featured Pictures and Quality Images
  - Filters for geolocated images with embedded GPS coordinates
  - Uses deterministic timestamp-based sorting for reproducible results
  - Includes retry logic and graceful error handling
  - Downloads to `demo/src/assets/photos/` for metadata generation

  **Usage:**

  ```bash
  cd demo
  npm run fetch-photos
  ```

  The script provides a self-contained way to populate the demo with realistic Creative Commons content for testing AI metadata generation and geolocation features.

### Patch Changes

- 611e39d: Fix photo grid responsive layout to show single column on mobile screens.
- c8e079f: Fix navigation thumbnails.
- 6428135: Fix TypeScript compilation errors in core integration files.
- 611e39d: Setup Git hooks and development workflow automation.

## 0.2.3

### Patch Changes

- Fix missing getStaticPaths in OG image route for static builds

  **Bug Fix:**
  - Added required `getStaticPaths()` function to `og-image.ts` route
  - OG image generation now works correctly in static builds
  - Pre-generates OG image routes for all published photos

  **Impact:**
  - Static builds (`astro build`) now complete successfully
  - OpenGraph images are properly generated for all photos
  - No breaking changes to existing functionality

## 0.2.2

### Patch Changes

- 218d13e: Fix JSX fragment syntax error in tag pagination component

  **Bug Fix:**
  - Fixed Astro build error: "Unable to assign attributes when using <> Fragment shorthand syntax"
  - Applied consistent JSX pattern from commit 218d1b24f: early return with null and simple ternary
  - Tag-based photo filtering pagination now builds correctly

  **Impact:**
  - Projects using astro-photostream now build without JSX syntax errors
  - Tag filtering feature works properly in production builds
  - No breaking changes to functionality

## 0.2.1

### Patch Changes

- Fix critical bug: integration now works with empty options

  **Bug Fix:**
  - Fixed integration failing when called with `photoStream()` or `photoStream({})`
  - Added default empty object to top-level integration options schema
  - Integration now works out-of-the-box without any required configuration

  **Impact:**
  - `npx astro add astro-photostream` now works correctly
  - Zero-config setup is truly zero-config
  - No breaking changes to existing configurations

## 0.2.0

### Minor Changes

- 42384fb: Initial release of Astro Photo Stream integration

  **Features:**
  - Photo galleries with responsive grid layouts (2/3/4 columns)
  - AI metadata generation using Claude API
  - Geolocation with privacy controls and reverse geocoding
  - EXIF extraction (camera settings, GPS, timestamps)
  - Interactive maps (single and multi-marker with clustering)
  - Content collection-based architecture with TypeScript support
  - Zero-config setup with `npx astro add astro-photo-stream`
  - Mobile-responsive design with lazy loading
  - SEO optimization with dynamic OpenGraph images
  - CLI tools for batch metadata processing
  - Keyboard navigation and accessibility features

  **Architecture:**
  - Source-first distribution (no build step required)
  - Modular class-based metadata processing
  - Theme-independent integration works with any Astro site
  - Configuration system with multiple override levels

### Patch Changes

- 3fe1ea3: Clean up internal references from old package name
- d9fb1af: fix package name

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of Astro Photo Stream integration
- Photo galleries with responsive grid layouts (2/3/4 columns)
- AI metadata generation using Claude API
- Geolocation with privacy controls and reverse geocoding
- EXIF extraction (camera settings, GPS, timestamps)
- Interactive maps (single and multi-marker with clustering)
- Content collection-based architecture with TypeScript support
- Zero-config setup with `npx astro add astro-photostream`
- Mobile-responsive design with lazy loading
- SEO optimization with dynamic OpenGraph images
- CLI tools for batch metadata processing
- Keyboard navigation and accessibility features
- Source-first distribution (no build step required)
- Modular class-based metadata processing
- Theme-independent integration works with any Astro site
- Configuration system with multiple override levels

### Changed

### Deprecated

### Removed

### Fixed

### Security
