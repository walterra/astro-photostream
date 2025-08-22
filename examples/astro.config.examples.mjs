/**
 * Astro Configuration Examples
 * 
 * Different ways to integrate astro-photo-stream with Astro projects.
 */

import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

// Example 1: Basic integration
export const basicConfig = defineConfig({
  integrations: [
    photoStream()
  ]
});

// Example 2: With other integrations
export const withOtherIntegrations = defineConfig({
  integrations: [
    // Other integrations first
    tailwind(),
    mdx(),
    sitemap(),
    
    // Photo stream integration
    photoStream({
      gallery: {
        itemsPerPage: 15
      },
      seo: {
        siteName: 'My Photography Site'
      }
    })
  ]
});

// Example 3: Environment-based configuration
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export const environmentConfig = defineConfig({
  integrations: [
    photoStream({
      ai: {
        enabled: isProd, // Only use AI in production
        provider: 'claude',
        apiKey: process.env.CLAUDE_API_KEY
      },
      photos: {
        quality: isDev ? 70 : 85, // Lower quality in dev
        maxWidth: isDev ? 1200 : 1920
      },
      gallery: {
        itemsPerPage: isDev ? 8 : 20 // Fewer items in dev
      }
    })
  ]
});

// Example 4: Multi-site configuration
export const multiSiteConfig = defineConfig({
  integrations: [
    photoStream({
      photos: {
        directory: 'src/content/photos'
      }
    })
  ],
  // Multiple sites can share the same photo integration
  experimental: {
    sites: {
      'main': {
        // Main photo gallery
        integrations: [photoStream()]
      },
      'portfolio': {
        // Portfolio-specific configuration
        integrations: [
          photoStream({
            gallery: {
              gridCols: { mobile: 1, tablet: 2, desktop: 3 }
            }
          })
        ]
      }
    }
  }
});

// Example 5: With custom routing
export const customRoutingConfig = defineConfig({
  integrations: [
    photoStream({
      // Custom base path for photos
      routePrefix: '/gallery',
      
      gallery: {
        itemsPerPage: 20
      }
    })
  ],
  
  // Custom routing setup
  routing: {
    prefixDefaultLocale: false
  }
});

// Example 6: TypeScript strict mode
export const typescriptConfig = defineConfig({
  integrations: [
    photoStream({
      // Full type safety
      photos: {
        directory: 'src/content/photos' as const,
        formats: ['jpg', 'png', 'webp'] as const
      }
    })
  ],
  
  // Strict TypeScript settings
  vite: {
    define: {
      'import.meta.env.STRICT_MODE': true
    }
  }
});

// Default export (use this in your astro.config.mjs)
export default defineConfig({
  integrations: [
    photoStream({
      // Your configuration here
      ai: {
        enabled: true,
        provider: 'claude',
        apiKey: process.env.CLAUDE_API_KEY
      },
      gallery: {
        itemsPerPage: 20,
        enableMap: true,
        enableTags: true
      },
      seo: {
        generateOpenGraph: true,
        siteName: 'My Photo Gallery'
      }
    })
  ]
});