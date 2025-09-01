import {
  defineIntegration,
  createResolver,
  addVirtualImports,
  addVitePlugin,
} from 'astro-integration-kit';
import { integrationOptionsSchema } from './types.js';

/**
 * Astro Photo Stream Integration
 *
 * Creates sophisticated photo galleries and streams with AI-powered metadata generation,
 * geolocation features, and responsive design.
 */
export default defineIntegration({
  name: 'astro-photostream',
  optionsSchema: integrationOptionsSchema,
  setup({ options }) {
    const { resolve } = createResolver(import.meta.url);
    // Create a resolver for the source files (routes/components) relative to package root
    const resolveSource = (path: string) => resolve(`../src/${path}`);

    return {
      hooks: {
        'astro:config:setup': async params => {
          const { updateConfig, injectRoute, command, logger, config } = params;
          if (!options.enabled) {
            logger.info('Astro Photo Stream integration is disabled');
            return;
          }

          logger.info('Setting up Astro Photo Stream integration...');

          // Resolve layout wrapper path relative to project root
          const resolvedLayoutWrapper = options.layout?.wrapper
            ? new URL(options.layout.wrapper, config.root).pathname
            : null;

          // Add virtual imports for configuration
          addVirtualImports(params, {
            name: 'astro-photostream',
            imports: {
              'virtual:astro-photostream/config': `
                export const config = ${JSON.stringify(options, null, 2)};
              `,
              'virtual:astro-photostream/utils': `
                export { generatePhotoMetadata } from '${resolve('./utils/metadata.js')}';
                export { processPhotoCollection } from '${resolve('./utils/collection.js')}';
                export { createPhotoRoutes } from '${resolve('./utils/routing.js')}';
              `,
              'virtual:astro-photostream/layout': `
                export const layoutConfig = ${JSON.stringify(options.layout || {}, null, 2)};
                export const shouldUseLayout = ${options.layout?.enabled || false};
                export const layoutWrapper = ${resolvedLayoutWrapper ? `"${resolvedLayoutWrapper}"` : 'null'};
                export const layoutProps = ${JSON.stringify(options.layout?.props || {}, null, 2)};
              `,
            },
          });

          // Inject photo gallery routes
          if (command === 'dev' || command === 'build') {
            // Determine route template suffix based on layout configuration
            const routeSuffix = options.layout?.enabled
              ? '.content.astro'
              : '.astro';

            // Main photo stream with pagination (Astro convention)
            injectRoute({
              pattern: '/photos/[...page]',
              entrypoint: resolveSource(
                `routes/photos/[...page]${routeSuffix}`
              ),
            });

            // Individual photo pages
            injectRoute({
              pattern: '/photos/[slug]',
              entrypoint: resolveSource(`routes/photos/[slug]${routeSuffix}`),
            });

            // Tag-based photo filtering with pagination
            if (options.gallery.enableTags) {
              injectRoute({
                pattern: '/photos/tags/[tag]/[...page]',
                entrypoint: resolveSource(
                  `routes/photos/tags/[tag]/[...page]${routeSuffix}`
                ),
              });
            }

            // OpenGraph image generation endpoints
            if (options.seo.generateOpenGraph) {
              // Individual photo OG images (text-only, works)
              injectRoute({
                pattern: '/api/og/photo/[slug].png',
                entrypoint: resolveSource('routes/og-image.ts'),
              });

              // Gallery OG images with photo grids
              injectRoute({
                pattern: '/og-image/photos.png',
                entrypoint: resolveSource('routes/og-image/photos.png.ts'),
              });

              injectRoute({
                pattern: '/og-image/photos/[...page].png',
                entrypoint: resolveSource(
                  'routes/og-image/photos/[...page].png.ts'
                ),
              });
            }
          }

          // Update Astro configuration
          updateConfig({
            vite: {
              define: {
                'import.meta.env.ASTRO_PHOTO_STREAM_CONFIG':
                  JSON.stringify(options),
              },
              optimizeDeps: {
                include: ['exifr', 'sharp'],
                exclude: ['@resvg/resvg-js'],
              },
            },
          });

          // Add Vite plugin for photo processing during build
          addVitePlugin(params, {
            plugin: {
              name: 'astro-photostream-processor',
              configResolved(config: any) {
                if (config.command === 'build') {
                  logger.info('Photo processing will run during build');
                }
              },
              buildStart() {
                if (options.ai.enabled && !options.ai.apiKey) {
                  logger.warn(
                    'AI metadata generation is enabled but no API key provided'
                  );
                }
              },
            },
          });

          logger.info('Astro Photo Stream integration setup complete');
        },

        'astro:config:done': ({ logger }) => {
          if (!options.enabled) return;

          // Validate configuration
          if (options.gallery.itemsPerPage > 100) {
            logger.warn('Large itemsPerPage value may impact performance');
          }

          logger.info(`Photo directory: ${options.photos.directory}`);
          logger.info(
            `Gallery configuration: ${options.gallery.itemsPerPage} items per page`
          );

          if (options.ai.enabled) {
            logger.info(
              `AI metadata generation enabled using ${options.ai.provider}`
            );
          }

          if (options.geolocation.enabled) {
            logger.info(
              `Geolocation enabled with ${options.geolocation.privacy.enabled ? 'privacy protection' : 'full precision'}`
            );
          }
        },

        'astro:build:start': ({ logger }) => {
          if (!options.enabled) return;

          logger.info('Starting photo processing for build...');
          // Photo processing logic will be implemented in Phase 2
        },

        'astro:build:done': ({ logger }) => {
          if (!options.enabled) return;

          logger.info('Photo stream build complete!');
          logger.info('Your photo gallery is ready to deploy');
        },
      },
    };
  },
});

// Export types for users
export type {
  IntegrationOptions,
  PhotoMetadata,
  PhotoCardProps,
  PhotoGridProps,
  PhotoStreamProps,
  MultiMarkerMapProps,
} from './types.js';
