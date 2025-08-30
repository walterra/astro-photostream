import { z } from 'zod';

/**
 * Content collection schema for photo entries - aligned with reference implementation
 * Based on the proven schema from /Users/walterra/dev/walterra-dev
 */
export const photoCollectionSchema = z.object({
  // Basic photo information - aligned with reference
  title: z.string().describe('Photo title or caption'),
  description: z.string().optional().describe('Detailed photo description'),

  // Cover image - exact match with reference
  coverImage: z
    .object({
      alt: z.string().describe('Alt text for accessibility'),
      src: z.unknown().describe('Image source - ImageMetadata or string URL'),
    })
    .describe('Main photo image'),

  // Camera info - simplified like reference
  camera: z.string().optional().describe('Camera make and model combined'),
  lens: z.string().optional().describe('Lens information'),

  // Camera settings - exact field names from reference
  settings: z
    .object({
      aperture: z.string().optional().describe('Aperture value (e.g., f/2.8)'),
      shutter: z.string().optional().describe('Shutter speed (e.g., 1/125s)'),
      iso: z.string().optional().describe('ISO sensitivity'),
      focalLength: z.string().optional().describe('Focal length (e.g., 85mm)'),
    })
    .optional()
    .describe('Camera settings from EXIF'),

  // Tags - required array like reference
  tags: z.array(z.string()).describe('Photo tags for categorization'),

  // Publish date - required like reference
  publishDate: z.coerce.date().describe('When the photo was published'),

  // Draft status - exact match with reference
  draft: z.boolean().default(false).describe('Whether photo is in draft mode'),

  // Location information - simplified like reference
  location: z
    .object({
      name: z.string().optional().describe('Human-readable location name'),
      latitude: z.number().optional().describe('GPS latitude'),
      longitude: z.number().optional().describe('GPS longitude'),
      coordinates: z
        .object({
          latitude: z.number().describe('GPS latitude coordinate'),
          longitude: z.number().describe('GPS longitude coordinate'),
        })
        .optional()
        .describe('GPS coordinates object'),
    })
    .optional()
    .describe('Photo location information'),
});

/**
 * Create content collection configuration for photos with image optimization
 */
export function createPhotoCollection({ image }: { image: () => any }) {
  return {
    type: 'content' as const,
    schema: photoCollectionSchema.extend({
      coverImage: z
        .object({
          alt: z.string().describe('Alt text for accessibility'),
          src: z
            .union([image(), z.string().url()])
            .describe('Image source - optimized ImageMetadata or URL'),
        })
        .describe('Main photo image'),
    }),
  };
}

// Export the schema type for TypeScript users
export type PhotoCollectionData = z.infer<typeof photoCollectionSchema>;

/**
 * Validation helper functions
 */
export const photoValidation = {
  /**
   * Validate GPS coordinates
   */
  isValidCoordinate: (lat?: number, lng?: number): boolean => {
    if (lat === undefined || lng === undefined) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  /**
   * Validate image dimensions
   */
  isValidDimensions: (width: number, height: number): boolean => {
    return width > 0 && height > 0 && width <= 50000 && height <= 50000;
  },

  /**
   * Validate file size (max 100MB)
   */
  isValidFileSize: (size?: number): boolean => {
    if (size === undefined) return true;
    return size > 0 && size <= 100 * 1024 * 1024; // 100MB
  },

  /**
   * Sanitize tags (lowercase, no spaces, alphanumeric + hyphens only)
   */
  sanitizeTags: (tags: string[]): string[] => {
    return tags
      .map(tag =>
        tag
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, '')
      )
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
  },
};
