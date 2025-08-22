/**
 * Template for users to set up content collections with astro-photo-stream
 * This file shows how to configure the photo collection in astro.config.mjs
 */

// Example astro.config.mjs configuration
export const exampleConfig = `
import { defineConfig } from 'astro/config';
import { createPhotoCollection } from 'astro-photo-stream/schema';

export default defineConfig({
  integrations: [
    // Your other integrations...
  ],
  
  // Content collections configuration
  content: {
    collections: {
      // Define the photos collection using our schema
      photos: createPhotoCollection(),
      
      // Your other collections...
      blog: {
        type: 'content',
        schema: ({ z }) => z.object({
          title: z.string(),
          // ... other blog fields
        })
      }
    }
  }
});
`;

// Example content/config.ts file
export const exampleContentConfig = `
import { defineCollection } from 'astro:content';
import { createPhotoCollection } from 'astro-photo-stream/schema';

// Define your content collections
const photos = createPhotoCollection();

const blog = defineCollection({
  type: 'content',
  schema: ({ z }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([])
  })
});

// Export collections object
export const collections = {
  photos,
  blog
};
`;

// Example photo frontmatter
export const examplePhotoFrontmatter = `
---
title: "Golden Hour at the Beach"
description: "A stunning sunset over the Pacific Ocean, captured during golden hour with warm, soft lighting illuminating the waves."
tags: 
  - sunset
  - beach
  - golden-hour
  - landscape
  - ocean

location:
  name: "Malibu Beach, California"
  coordinates:
    latitude: 34.0259
    longitude: -118.7798
  privacy:
    blurred: false
    radius: 100
    method: "blur"

camera:
  make: "Canon"
  model: "EOS R5"
  lens: "RF 24-70mm F2.8 L IS USM"

settings:
  iso: 100
  aperture: "f/8"
  shutterSpeed: "1/125"
  focalLength: "35mm"
  flash: false
  exposureMode: "Manual"
  meteringMode: "Evaluative"
  whiteBalance: "Daylight"

dateTime:
  taken: 2024-08-15T18:45:00Z
  published: 2024-08-22T10:00:00Z

file:
  name: "sunset-malibu-beach.jpg"
  path: "/photos/2024/08/sunset-malibu-beach.jpg"
  size: 4287562
  format: "jpg"
  dimensions:
    width: 4000
    height: 2667
  colorSpace: "sRGB"
  orientation: 1

social:
  featured: true
  allowDownload: true
  license: "CC BY-SA 4.0"
  copyright: "© 2024 Your Name"
  altText: "Golden sunset over ocean waves at Malibu Beach with warm orange and pink sky colors"

ai:
  generated: true
  confidence: 0.94
  model: "claude-3-5-sonnet"
  generatedAt: 2024-08-22T10:30:00Z

processing:
  edited: true
  software: "Adobe Lightroom Classic"
  filters: ["Vibrance +20", "Clarity +10", "Graduated Filter"]
  processingNotes: "Enhanced golden hour colors and added graduated filter to balance sky exposure"
---

This breathtaking sunset photograph was captured during golden hour at Malibu Beach, showcasing the Pacific Ocean's natural beauty. The warm, diffused lighting creates a magical atmosphere as waves gently lap against the shore.

The composition emphasizes the dramatic sky filled with golden and pink hues, while the ocean provides a calming counterbalance. Shot with a wide-angle lens to capture the expansive scene, this image represents the perfect harmony between sea and sky during one of nature's most spectacular daily performances.

Technical details: This image was captured using manual exposure settings to ensure proper balance between the bright sky and darker foreground elements. Post-processing enhanced the natural golden tones while maintaining realistic color representation.
`;

console.log('Astro Photo Stream Integration Template');
console.log('=====================================');
console.log('');
console.log('1. astro.config.mjs example:');
console.log(exampleConfig);
console.log('');
console.log('2. content/config.ts example:');
console.log(exampleContentConfig);
console.log('');
console.log('3. Example photo frontmatter:');
console.log(examplePhotoFrontmatter);