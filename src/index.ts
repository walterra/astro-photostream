import { defineIntegration, createResolver, addVirtualImports, addVitePlugin } from 'astro-integration-kit';
import { integrationOptionsSchema, type IntegrationOptions } from './types.js';

/**
 * Astro Photo Stream Integration
 * 
 * Creates sophisticated photo galleries and streams with AI-powered metadata generation,
 * geolocation features, and responsive design.
 */
export default defineIntegration({
  name: 'astro-photo-stream',
  optionsSchema: integrationOptionsSchema,
  setup({ name, options }) {
    const { resolve } = createResolver(import.meta.url);
    // Create a resolver for the source files (routes/components) relative to package root
    const resolveSource = (path: string) => resolve(`../src/${path}`);
    
    return {
      hooks: {
        'astro:config:setup': async (params) => {
          const { updateConfig, injectRoute, command, logger } = params;
          if (!options.enabled) {
            logger.info('Astro Photo Stream integration is disabled');
            return;
          }
          
          logger.info('Setting up Astro Photo Stream integration...');
          
          // Add virtual imports for configuration
          addVirtualImports(params, {
            name: 'astro-photo-stream',
            imports: {
              'virtual:astro-photo-stream/config': `
                export const config = ${JSON.stringify(options, null, 2)};
              `,
              'virtual:astro-photo-stream/utils': `
                export { generatePhotoMetadata } from '${resolve('./utils/metadata.js')}';
                export { processPhotoCollection } from '${resolve('./utils/collection.js')}';
                export { createPhotoRoutes } from '${resolve('./utils/routing.js')}';
              `
            }
          });
          
          // Inject photo gallery routes
          if (command === 'dev' || command === 'build') {
            // Main photo stream with pagination (Astro convention)
            injectRoute({
              pattern: '/photos/[...page]',
              entrypoint: resolveSource('routes/photos/[...page].astro')
            });
            
            // Individual photo pages
            injectRoute({
              pattern: '/photos/[slug]',
              entrypoint: resolveSource('routes/photos/[slug].astro')
            });
            
            // Tag-based photo filtering with pagination
            if (options.gallery.enableTags) {
              injectRoute({
                pattern: '/photos/tags/[tag]/[...page]',
                entrypoint: resolveSource('routes/photos/tags/[tag]/[...page].astro')
              });
            }
            
            // OpenGraph image generation endpoint
            if (options.seo.generateOpenGraph) {
              injectRoute({
                pattern: '/api/og/photo/[slug].png',
                entrypoint: resolveSource('routes/og-image.ts')
              });
            }
          }
          
          // Update Astro configuration
          updateConfig({
            vite: {
              define: {
                'import.meta.env.ASTRO_PHOTO_STREAM_CONFIG': JSON.stringify(options)
              },
              optimizeDeps: {
                include: ['exifr', 'sharp']
              }
            }
          });
          
          // Add Vite plugin for photo processing during build
          addVitePlugin(params, {
            plugin: {
              name: 'astro-photo-stream-processor',
              configResolved(config: any) {
                if (config.command === 'build') {
                  logger.info('Photo processing will run during build');
                }
              },
              buildStart() {
                if (options.ai.enabled && !options.ai.apiKey) {
                  logger.warn('AI metadata generation is enabled but no API key provided');
                }
              }
            }
          });
          
          logger.info('Astro Photo Stream integration setup complete');
        },
        
        'astro:config:done': ({ config, logger }) => {
          if (!options.enabled) return;
          
          // Validate configuration
          if (options.gallery.itemsPerPage > 100) {
            logger.warn('Large itemsPerPage value may impact performance');
          }
          
          logger.info(`Photo directory: ${options.photos.directory}`);
          logger.info(`Gallery configuration: ${options.gallery.itemsPerPage} items per page`);
          
          if (options.ai.enabled) {
            logger.info(`AI metadata generation enabled using ${options.ai.provider}`);
          }
          
          if (options.geolocation.enabled) {
            logger.info(`Geolocation enabled with ${options.geolocation.privacy.enabled ? 'privacy protection' : 'full precision'}`);
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
        }
      }
    };
  }
});

// Export types for users
export type { 
  IntegrationOptions,
  PhotoMetadata,
  PhotoCardProps,
  PhotoGridProps,
  PhotoStreamProps,
  MultiMarkerMapProps
} from './types.js';