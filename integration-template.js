/**
 * Template for users to set up content collections with astro-photostream
 * Aligned with reference implementation from /Users/walterra/dev/walterra-dev
 * 
 * This file shows how to configure the photo collection exactly as it works
 * in the proven reference implementation.
 */

// Example astro.config.mjs configuration
export const exampleConfig = `
import { defineConfig } from 'astro/config';
import photoStreamIntegration from 'astro-photostream';

export default defineConfig({
  integrations: [
    // Add the photo stream integration
    photoStreamIntegration({
      // Configure photo processing
      photos: {
        directory: 'src/assets/photos', // Where your photos are stored
        formats: ['jpg', 'jpeg', 'png', 'webp']
      },
      
      // AI metadata generation (optional)
      ai: {
        enabled: true,
        provider: 'claude',
        apiKey: process.env.ANTHROPIC_API_KEY // Set in .env
      },
      
      // Geolocation features (optional)
      geolocation: {
        enabled: true,
        // Requires OPENCAGE_API_KEY in .env for location names
      },
      
      // Gallery display options
      gallery: {
        itemsPerPage: 12,
        gridCols: {
          mobile: 2,
          tablet: 3,
          desktop: 4
        }
      }
    }),
    
    // Your other integrations...
  ]
});
`;

// Example content/config.ts file - aligned with reference
export const exampleContentConfig = `
import { defineCollection } from 'astro:content';
import { createPhotoCollection } from 'astro-photostream/schema';

// Photo collection using reference implementation schema
const photo = createPhotoCollection();

// Your other collections
const blog = defineCollection({
  type: 'content',
  schema: ({ z }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([])
  })
});

// Export collections (note: 'photo' not 'photos' - matches reference)
export const collections = {
  photo, // Collection name must match reference
  blog
};
`;

// Example photo frontmatter - EXACTLY aligned with reference implementation
export const examplePhotoFrontmatter = `
---
title: "Golden Hour Beach Vibes (With Extra Saturation Because Why Not)"
description: "A sunset over the Pacific Ocean that looks suspiciously like every other sunset photo on the internet, but hey, at least the colors are nice. Shot with a camera that cost more than my car."
publishDate: 2024-08-15
coverImage:
  src: ../../assets/photos/sunset-malibu-beach.jpg
  alt: "Sunset over ocean waves with dramatic orange and pink sky colors reflecting on the water"
camera: "Canon EOS R5"
lens: "RF 24-70mm F2.8 L IS USM"
settings:
  aperture: "f/8"
  shutter: "1/125s"
  iso: "100"
  focalLength: "35mm"
location:
  name: "Malibu Beach, California"
  latitude: 34.0259
  longitude: -118.7798
tags: 
  - sunset
  - beach
  - golden-hour
  - landscape
  - ocean
  - 2024
draft: false
---

Another golden hour beach photo, because apparently I can't help myself. The warm light was actually pretty spectacular that evening, even if every photographer in Southern California was probably shooting the exact same scene.

Technical note: Used manual exposure to balance the bright sky with the darker foreground. The natural golden tones were enhanced slightly in post, but not as much as you might think – sometimes the real world is actually that saturated.

Shot during a weekend trip to Malibu. The waves were gentle that day, creating nice smooth reflections of the sky colors. Perfect conditions for this type of cliché-but-beautiful sunset photography.
`;

// Environment variables setup
export const environmentSetup = `
# Required environment variables for astro-photostream
# Add these to your .env file

# Claude API for AI metadata generation (optional but recommended)
ANTHROPIC_API_KEY=your_claude_api_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307
ANTHROPIC_MAX_TOKENS=400

# OpenCage API for location names (optional)
OPENCAGE_API_KEY=your_opencage_api_key_here

# Geoapify API for static maps (optional)  
GEOAPIFY_API_KEY=your_geoapify_api_key_here

# Photo processing configuration
PHOTOS_DIRECTORY=./src/assets/photos
CONTENT_DIRECTORY=./src/content/photo
\`;

// CLI usage examples
export const cliExamples = \`
# Generate metadata for all photos in your photos directory
npx astro-photostream generate

# Generate metadata for a specific photo
npx astro-photostream generate path/to/photo.jpg

# Process photos with AI enhancement (requires ANTHROPIC_API_KEY)
npx astro-photostream generate --ai

# Update location names only (requires OPENCAGE_API_KEY)
npx astro-photostream generate --update-locations

# Force regenerate all metadata (overwrites existing)
npx astro-photostream generate --force
\`;

console.log('🚀 Astro Photo Stream Integration Setup');
console.log('======================================');
console.log('Based on proven reference implementation\n');

console.log('1️⃣  ASTRO CONFIG (astro.config.mjs):');
console.log(exampleConfig);
console.log('\n2️⃣  CONTENT CONFIG (src/content/config.ts):');
console.log(exampleContentConfig);
console.log('\n3️⃣  PHOTO FRONTMATTER EXAMPLE:');
console.log(examplePhotoFrontmatter);
console.log('\n4️⃣  ENVIRONMENT SETUP (.env):');
console.log(environmentSetup);
console.log('\n5️⃣  CLI USAGE:');
console.log(cliExamples);
console.log('\n✨ Ready to create beautiful photo galleries!');
console.log('📖 Docs: https://github.com/walterra/astro-photostream#readme');`;