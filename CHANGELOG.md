# Changelog

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
