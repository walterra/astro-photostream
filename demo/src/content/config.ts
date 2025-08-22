import { defineCollection } from 'astro:content';
import { photoSchema } from 'astro-photo-stream/schema';

// Photo collection using the astro-photo-stream schema
const photos = defineCollection({
  type: 'content',
  schema: photoSchema
});

export const collections = { photos };