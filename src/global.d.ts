// Global type declarations for TypeScript compilation
import * as L from 'leaflet';

// Extend Window interface for Leaflet
declare global {
  interface Window {
    L: typeof L;
  }
}

// Astro component declarations
declare module '*.astro' {
  const Component: unknown;
  export default Component;
}

// Virtual module declarations
declare module 'virtual:astro-photostream/config' {
  export const config: unknown;
}

declare module 'virtual:astro-photostream/utils' {
  export const generatePhotoMetadata: unknown;
  export const processPhotoCollection: unknown;
  export const createPhotoRoutes: unknown;
}

// Astro content declarations for build time
declare module 'astro:content' {
  export function getCollection(
    collection: string,
    filter?: (entry: unknown) => boolean
  ): Promise<unknown[]>;
  export function getEntry(collection: string, slug: string): Promise<unknown>;
  export function getEntries(
    collection: string,
    slugs: string[]
  ): Promise<unknown[]>;
  export function defineCollection(config: unknown): unknown;
  export function reference(collection: string): unknown;
  export const z: unknown;
}
