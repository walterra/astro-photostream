/**
 * Content Collection Examples
 * 
 * Different ways to set up and extend the photo content collection.
 */

import { defineCollection, z } from 'astro:content';
import { photoSchema } from 'astro-photostream/schema';

// Example 1: Basic photo collection
const basicPhotos = defineCollection({
  type: 'content',
  schema: photoSchema
});

// Example 2: Extended photo schema with custom fields
const extendedPhotoSchema = photoSchema.extend({
  // Add custom fields
  featured: z.boolean().default(false),
  series: z.string().optional(),
  
  // Extended equipment info
  equipment: z.object({
    tripod: z.boolean().optional(),
    filters: z.array(z.string()).optional(),
    lighting: z.string().optional(),
    additionalLenses: z.array(z.string()).optional()
  }).optional(),
  
  // Social media info
  social: z.object({
    instagramUrl: z.string().url().optional(),
    facebookUrl: z.string().url().optional(),
    featured: z.boolean().default(false)
  }).optional(),
  
  // Editorial information
  editorial: z.object({
    published: z.boolean().default(false),
    publishedIn: z.string().optional(),
    rights: z.enum(['all-rights', 'limited', 'creative-commons']).default('all-rights')
  }).optional()
});

const extendedPhotos = defineCollection({
  type: 'content',
  schema: extendedPhotoSchema
});

// Example 3: Multiple photo collections
const portfolioPhotos = defineCollection({
  type: 'content',
  schema: photoSchema.extend({
    category: z.enum(['landscape', 'portrait', 'street', 'macro', 'astrophotography']),
    clientWork: z.boolean().default(false),
    printAvailable: z.boolean().default(false),
    price: z.number().optional()
  })
});

const blogPhotos = defineCollection({
  type: 'content',
  schema: photoSchema.extend({
    postUrl: z.string().url().optional(),
    excerpt: z.string().max(200).optional(),
    readingTime: z.number().optional()
  })
});

const travelPhotos = defineCollection({
  type: 'content',
  schema: photoSchema.extend({
    country: z.string(),
    city: z.string().optional(),
    trip: z.string().optional(),
    travelDate: z.date(),
    companions: z.array(z.string()).optional()
  })
});

// Example 4: Schema with validation
const strictPhotoSchema = photoSchema.extend({
  // Enforce specific tag categories
  tags: z.array(z.string()).min(1).max(10),
  
  // Require certain fields
  description: z.string().min(20).max(500),
  
  // Validate image dimensions
  coverImage: z.object({
    src: z.any(),
    alt: z.string().min(10).max(100),
    width: z.number().min(800).optional(),
    height: z.number().min(600).optional()
  }),
  
  // Custom validation for publication workflow
  publishDate: z.date().refine(
    (date) => date <= new Date(),
    { message: "Publication date cannot be in the future" }
  )
});

// Example 5: Collection with computed fields
const computedPhotoSchema = photoSchema.extend({
  // These would be computed by the integration
  slug: z.string().optional(),
  url: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  
  // Computed from EXIF data
  aspectRatio: z.number().optional(),
  fileSize: z.number().optional(),
  colorProfile: z.string().optional()
});

// Example 6: Internationalized schema
const i18nPhotoSchema = photoSchema.extend({
  translations: z.object({
    en: z.object({
      title: z.string(),
      description: z.string().optional()
    }),
    es: z.object({
      title: z.string(),
      description: z.string().optional()
    }).optional(),
    fr: z.object({
      title: z.string(),
      description: z.string().optional()
    }).optional()
  }).optional()
});

// Export collections object (use in src/content/config.ts)
export const basicCollections = {
  photos: basicPhotos
};

export const extendedCollections = {
  photos: extendedPhotos
};

export const multipleCollections = {
  'portfolio-photos': portfolioPhotos,
  'blog-photos': blogPhotos,
  'travel-photos': travelPhotos
};

export const strictCollections = {
  photos: defineCollection({
    type: 'content',
    schema: strictPhotoSchema
  })
};

// Default collections export
export const collections = {
  photos: defineCollection({
    type: 'content',
    schema: photoSchema
  })
};