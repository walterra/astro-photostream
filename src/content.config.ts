import { defineCollection, z } from "astro:content";
import { photoCollectionSchema } from "./schema.js";

// Define the photo collection using our schema
export const collections = {
  photos: defineCollection({
    type: "content",
    schema: photoCollectionSchema,
  }),
};
