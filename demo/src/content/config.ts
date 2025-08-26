import { defineCollection, z } from 'astro:content';

// Photo collection with image optimization enabled
const photos = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    coverImage: z.object({
      alt: z.string(),
      src: z.union([image(), z.string().url()]) // Enable image optimization
    }),
    camera: z.string().optional(),
    lens: z.string().optional(),
    settings: z.object({
      aperture: z.string().optional(),
      shutter: z.string().optional(),
      iso: z.string().optional(),
      focalLength: z.string().optional()
    }).optional(),
    location: z.object({
      name: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional(),
    tags: z.array(z.string()).default([]),
    publishDate: z.string().or(z.date()).transform(val => new Date(val)),
    draft: z.boolean().default(false)
  })
});

export const collections = { photos };