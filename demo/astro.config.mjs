import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
// import photoStream from 'astro-photo-stream';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    // Temporarily disabled until package is built
    // photoStream()
  ],
  site: 'https://astro-photostream-demo.vercel.app'
});