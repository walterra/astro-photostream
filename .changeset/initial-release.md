---
"astro-photo-stream": minor
---

Initial release of Astro Photo Stream integration

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