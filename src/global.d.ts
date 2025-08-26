// Global type declarations for TypeScript compilation
import * as L from 'leaflet';

// Extend Window interface for Leaflet
declare global {
  interface Window {
    L: typeof L;
  }
}

// Astro component declarations
declare module "*.astro" {
  const Component: any;
  export default Component;
}

// Virtual module declarations
declare module "virtual:astro-photostream/config" {
  export const config: any;
}

declare module "virtual:astro-photostream/utils" {
  export const generatePhotoMetadata: any;
  export const processPhotoCollection: any;
  export const createPhotoRoutes: any;
}

// Astro content declarations for build time
declare module "astro:content" {
  export function getCollection(
    collection: string,
    filter?: (entry: any) => boolean,
  ): Promise<any[]>;
  export function getEntry(collection: string, slug: string): Promise<any>;
  export function getEntries(
    collection: string,
    slugs: string[],
  ): Promise<any[]>;
  export function defineCollection(config: any): any;
  export function reference(collection: string): any;
  export const z: any;
}
