# 📋 Configuration Examples

This directory contains ready-to-use configuration examples for different use cases and scenarios.

## Configuration Files

### Basic Configurations

- **`minimal.config.js`** - Absolute minimum setup with defaults
- **`astro-photo-stream.config.js`** - Complete configuration with all options documented

### Use Case Specific

- **`photography-blog.config.js`** - Optimized for photography blogs with AI metadata
- **`portfolio.config.js`** - Professional portfolio with high-quality images
- **`high-privacy.config.js`** - Maximum privacy protection for sensitive photos
- **`performance-optimized.config.js`** - Fast loading and minimal resource usage

### Advanced Examples

- **`astro.config.examples.mjs`** - Various Astro integration patterns
- **`content-collection.examples.ts`** - Extended content collection schemas

## Quick Start

1. **Choose a configuration** that matches your use case
2. **Copy the file** to your project root as `astro-photo-stream.config.js`
3. **Customize the settings** for your specific needs
4. **Set environment variables** for API keys if using AI features

## Environment Variables

Create a `.env` file in your project root:

```bash
# AI Provider API Keys
CLAUDE_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# Geolocation API Key (optional)
OPENCAGE_API_KEY=your-opencage-key

# Custom config path (optional)
ASTRO_PHOTO_STREAM_CONFIG_PATH=./custom-config.js
```

## Usage Examples

### Photography Blog Setup

```bash
# Copy the blog configuration
cp examples/photography-blog.config.js astro-photo-stream.config.js

# Set up your environment
echo "CLAUDE_API_KEY=your-key-here" >> .env

# Install and configure
npx astro add astro-photo-stream
```

### Portfolio Site Setup

```bash
# Copy the portfolio configuration
cp examples/portfolio.config.js astro-photo-stream.config.js

# Customize for your needs
# Edit astro-photo-stream.config.js
```

### High Privacy Setup

```bash
# Copy the privacy-focused configuration
cp examples/high-privacy.config.js astro-photo-stream.config.js

# No API keys needed - AI features disabled for privacy
```

## Content Collection Setup

Choose from the content collection examples in `content-collection.examples.ts`:

### Basic Setup

```ts
// src/content/config.ts
import { defineCollection } from 'astro:content';
import { photoSchema } from 'astro-photo-stream/schema';

const photos = defineCollection({
  type: 'content',
  schema: photoSchema
});

export const collections = { photos };
```

### Extended Schema

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { photoSchema } from 'astro-photo-stream/schema';

const photos = defineCollection({
  type: 'content',
  schema: photoSchema.extend({
    featured: z.boolean().default(false),
    series: z.string().optional(),
    // Add your custom fields
  })
});

export const collections = { photos };
```

## Configuration Scenarios

### Development vs Production

Use environment-based configuration for different settings:

```js
// astro-photo-stream.config.js
const isDev = process.env.NODE_ENV === 'development';

export default {
  ai: {
    enabled: !isDev, // Disable AI in development
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
};
```

### Multiple Photo Types

Set up different collections for different photo types:

```ts
// src/content/config.ts
import { defineCollection } from 'astro:content';
import { photoSchema } from 'astro-photo-stream/schema';

export const collections = {
  'portfolio-photos': defineCollection({
    type: 'content',
    schema: photoSchema.extend({
      category: z.enum(['landscape', 'portrait', 'street']),
      printAvailable: z.boolean().default(false)
    })
  }),
  
  'blog-photos': defineCollection({
    type: 'content',
    schema: photoSchema.extend({
      postUrl: z.string().url().optional(),
      excerpt: z.string().max(200).optional()
    })
  })
};
```

## CLI Configuration

### Basic CLI Usage

```bash
# Generate all metadata
npx astro-photo-stream

# Generate only AI metadata
npx astro-photo-stream --ai

# Generate only location data
npx astro-photo-stream --location

# Update EXIF data only
npx astro-photo-stream --update-exif
```

### Custom CLI Config

Create `.photostream.config.json`:

```json
{
  "defaultArgs": ["--ai", "--location"],
  "batchSize": 10,
  "concurrency": 3,
  "retryAttempts": 2,
  "outputFormat": "detailed"
}
```

## Integration with Other Tools

### With Tailwind CSS

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    tailwind(), // Add Tailwind first
    photoStream({
      // Your photo stream config
    })
  ]
});
```

### With MDX

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    mdx(),
    photoStream()
  ]
});
```

### With View Transitions

```astro
---
// src/layouts/PhotoLayout.astro
import { ViewTransitions } from 'astro:transitions';
---

<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <main transition:animate="slide">
      <!-- Photo content with smooth transitions -->
      <slot />
    </main>
  </body>
</html>
```

## Troubleshooting

### Common Issues

1. **API Key not working**
   ```bash
   # Check environment variables
   echo $CLAUDE_API_KEY
   
   # Verify in configuration
   console.log(process.env.CLAUDE_API_KEY);
   ```

2. **Photos not showing**
   ```bash
   # Check directory structure
   ls -la src/content/photos/
   
   # Verify content collection setup
   npx astro check
   ```

3. **Build failing**
   ```bash
   # Check configuration
   npx astro-photo-stream --generate-config
   
   # Run with verbose output
   npx astro-photo-stream --verbose
   ```

### Performance Tips

1. **Optimize for build time**
   - Disable AI in development
   - Use smaller image sizes in dev
   - Process photos in batches

2. **Optimize for runtime**
   - Use modern image formats (WebP, AVIF)
   - Enable lazy loading
   - Configure appropriate quality settings

## Need Help?

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/walterra/astro-photostream/issues)
- 💬 [Astro Discord](https://astro.build/chat)

---

**Choose the configuration that best matches your needs and customize from there!**