import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import photoStream from 'astro-photostream';

export default defineConfig({
  integrations: [
    tailwind(),
    photoStream({
      layout: {
        enabled: true,
        wrapper: './src/layouts/Layout.astro',
        props: {
          customProp: 'layout-integration-working'
        }
      }
    }),
  ],
});
