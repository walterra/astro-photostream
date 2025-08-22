import { defineCollection, z } from 'astro:content';
// import { photoSchema } from 'astro-photo-stream/schema';

// Temporary basic photo schema for demo
const photoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  coverImage: z.object({
    src: z.string(),
    alt: z.string()
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
  tags: z.array(z.string()),
  publishDate: z.coerce.date(),
  draft: z.boolean()
});

const photos = defineCollection({
  type: 'content',
  schema: photoSchema
});

export const collections = { photos };