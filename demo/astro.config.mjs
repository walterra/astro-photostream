import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import photoStream from 'astro-photo-stream';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    photoStream({
      // Demo configuration showcasing all features
      photos: {
        directory: 'src/content/photos',
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85
      },
      
      // AI metadata generation (will use env vars)
      ai: {
        enabled: true,
        provider: 'claude',
        model: 'claude-3-sonnet-20240229'
      },
      
      // Geolocation with privacy features
      geolocation: {
        enabled: true,
        privacy: {
          enabled: true,
          radius: 1000,
          method: 'blur'
        }
      },
      
      // Gallery display options
      gallery: {
        itemsPerPage: 12,
        gridCols: {
          mobile: 2,
          tablet: 3,
          desktop: 4
        },
        enableMap: true,
        enableTags: true,
        enableSearch: false
      },
      
      // SEO optimization
      seo: {
        generateOpenGraph: true,
        siteName: 'Astro Photo Stream Demo',
        twitterHandle: '@astrophoto'
      }
    })
  ],
  site: 'https://astro-photostream-demo.vercel.app'
});