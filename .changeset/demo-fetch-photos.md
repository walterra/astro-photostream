---
'astro-photostream': patch
---

Add Creative Commons photo fetch script for demo

Implements a new demo script that downloads high-quality Creative Commons photos from Wikimedia Commons with GPS coordinates for testing the photo stream integration features.

**Demo Script Features:**

- Fetches ~20 professional photos from Wikimedia Featured Pictures and Quality Images
- Filters for geolocated images with embedded GPS coordinates
- Uses deterministic timestamp-based sorting for reproducible results
- Includes retry logic and graceful error handling
- Downloads to `demo/src/assets/photos/` for metadata generation

**Technical Improvements:**

- Fixed TypeScript compilation errors in config.ts and metadata.ts
- Added missing `apiKey` field to geolocation schema in types.ts
- Improved type safety for dynamic imports and object spread operations
- Enhanced demo README with comprehensive script documentation

**Usage:**

```bash
cd demo
npm run fetch-photos
```

The script provides a self-contained way to populate the demo with realistic Creative Commons content for testing AI metadata generation and geolocation features.
