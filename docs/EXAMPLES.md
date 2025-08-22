# 📋 Configuration Examples

Real-world configuration examples for different use cases and scenarios.

## Basic Configurations

### Minimal Setup (Zero Config)

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream()
    // Uses all defaults - works out of the box!
  ]
});
```

### Photography Blog

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      gallery: {
        itemsPerPage: 15,
        gridCols: {
          mobile: 1,
          tablet: 2,
          desktop: 3
        },
        enableMap: true,
        enableTags: true
      },
      seo: {
        generateOpenGraph: true,
        siteName: 'Nature Photography Blog',
        twitterHandle: '@naturephotog'
      }
    })
  ]
});
```

### Portfolio Site

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      photos: {
        quality: 95, // Higher quality for portfolio
        maxWidth: 2560,
        maxHeight: 1440
      },
      gallery: {
        itemsPerPage: 12,
        gridCols: {
          mobile: 1,
          tablet: 2,
          desktop: 3
        },
        enableMap: false, // Focus on photos, not locations
        enableTags: true
      },
      seo: {
        generateOpenGraph: true,
        siteName: 'John Doe Photography Portfolio'
      }
    })
  ]
});
```

## AI-Powered Configurations

### With Claude AI

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      ai: {
        enabled: true,
        provider: 'claude',
        apiKey: process.env.CLAUDE_API_KEY,
        model: 'claude-3-sonnet-20240229',
        prompt: `Analyze this photograph professionally. Provide:
- A compelling, descriptive title (under 60 characters)
- A detailed description (2-3 sentences) focusing on composition, lighting, and mood
- 3-5 relevant tags for categorization
- Consider the technical aspects visible in the image`
      },
      geolocation: {
        enabled: true,
        privacy: {
          enabled: true,
          radius: 1000,
          method: 'blur'
        }
      }
    })
  ]
});
```

### With OpenAI

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      ai: {
        enabled: true,
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4-vision-preview',
        prompt: `You are a professional photography curator. Analyze this image and provide:
1. A catchy title that captures the essence of the photo
2. A descriptive paragraph about what makes this photo special
3. Relevant tags for organization and discovery`
      }
    })
  ]
});
```

## Privacy-Focused Configurations

### High Privacy

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      geolocation: {
        enabled: true,
        privacy: {
          enabled: true,
          radius: 5000, // 5km blur radius
          method: 'blur'
        }
      },
      gallery: {
        enableMap: false // Disable maps entirely
      },
      seo: {
        generateOpenGraph: false // No automatic OG images
      }
    })
  ]
});
```

### Location Offset

```js
// astro.config.mjs
export default defineConfig({
  integrations: [
    photoStream({
      geolocation: {
        enabled: true,
        privacy: {
          enabled: true,
          radius: 2000,
          method: 'offset' // Randomly offset coordinates
        }
      }
    })
  ]
});
```

## Performance-Optimized Configurations

### High Traffic Site

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      photos: {
        formats: ['webp', 'avif', 'jpg'], // Modern formats first
        quality: 80, // Balanced quality/size
        maxWidth: 1920,
        maxHeight: 1080
      },
      gallery: {
        itemsPerPage: 30, // More photos per page
        enableSearch: false, // Disable resource-intensive features
      },
      ai: {
        enabled: false // Disable for faster builds
      }
    })
  ]
});
```

### Mobile-First

```js
// astro.config.mjs
export default defineConfig({
  integrations: [
    photoStream({
      photos: {
        maxWidth: 1200, // Smaller max size
        quality: 75
      },
      gallery: {
        itemsPerPage: 20,
        gridCols: {
          mobile: 2,
          tablet: 3,
          desktop: 4
        }
      }
    })
  ]
});
```

## Advanced Configurations

### Multi-Language Site

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import photoStream from 'astro-photo-stream';

export default defineConfig({
  integrations: [
    photoStream({
      ai: {
        enabled: true,
        provider: 'claude',
        apiKey: process.env.CLAUDE_API_KEY,
        prompt: `Analyze this photo and provide metadata in English:
- Title: A compelling, descriptive title
- Description: 2-3 sentences about the photo
- Tags: 3-5 relevant English tags
Keep language simple and accessible for international audiences.`
      },
      seo: {
        generateOpenGraph: true,
        siteName: 'Global Photography',
        twitterHandle: '@globalphotos'
      }
    })
  ]
});
```

### Event Photography

```js
// astro.config.mjs
export default defineConfig({
  integrations: [
    photoStream({
      photos: {
        directory: 'src/content/events',
        quality: 85
      },
      gallery: {
        itemsPerPage: 50, // Many photos per event
        gridCols: {
          mobile: 3,
          tablet: 4,
          desktop: 6
        },
        enableMap: true, // Show event locations
        enableTags: true // Organize by event type
      },
      geolocation: {
        enabled: true,
        privacy: {
          enabled: false // Events are public
        }
      }
    })
  ]
});
```

## Configuration Files

### Full Configuration File

Create `astro-photo-stream.config.js`:

```js
export default {
  enabled: true,
  
  photos: {
    directory: 'src/content/photos',
    formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85
  },
  
  ai: {
    enabled: true,
    provider: 'claude',
    model: 'claude-3-sonnet-20240229',
    prompt: `As a professional photography curator, analyze this image and provide:

**Title**: A compelling, descriptive title (under 60 characters) that captures the essence and mood of the photograph.

**Description**: A detailed 2-3 sentence description focusing on:
- The main subject and composition
- Notable lighting, colors, or atmospheric conditions  
- The emotional impact or story the image conveys

**Tags**: 3-5 specific, relevant tags for categorization. Include:
- Genre (landscape, portrait, street, etc.)
- Key subjects or themes
- Mood or style descriptors
- Technical aspects if notable

Be creative but accurate, helping viewers connect with the photograph.`
  },
  
  geolocation: {
    enabled: true,
    privacy: {
      enabled: true,
      radius: 1000,
      method: 'blur'
    }
  },
  
  gallery: {
    itemsPerPage: 20,
    gridCols: {
      mobile: 2,
      tablet: 3,
      desktop: 4
    },
    enableMap: true,
    enableTags: true,
    enableSearch: false
  },
  
  seo: {
    generateOpenGraph: true,
    siteName: 'My Photography Site',
    twitterHandle: '@myphotos'
  }
};
```

### Environment Variables

```bash
# .env
CLAUDE_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
OPENCAGE_API_KEY=your-opencage-key

# Optional: Custom configuration
ASTRO_PHOTO_STREAM_CONFIG_PATH=./custom-photo-config.js
```

### Development vs Production

```js
// astro.config.mjs
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  integrations: [
    photoStream({
      ai: {
        enabled: !isDev, // Disable AI in development for faster builds
        provider: 'claude',
        apiKey: process.env.CLAUDE_API_KEY
      },
      photos: {
        quality: isDev ? 70 : 85, // Lower quality in dev
        maxWidth: isDev ? 1200 : 1920
      },
      gallery: {
        itemsPerPage: isDev ? 10 : 20 // Fewer items in dev
      }
    })
  ]
});
```

## Content Collection Setup

### Basic Content Collection

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

### Extended Content Collection

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { photoSchema } from 'astro-photo-stream/schema';

// Extend the base schema with custom fields
const extendedPhotoSchema = photoSchema.extend({
  featured: z.boolean().default(false),
  series: z.string().optional(),
  equipment: z.object({
    tripod: z.boolean().optional(),
    filters: z.array(z.string()).optional(),
    lighting: z.string().optional()
  }).optional()
});

const photos = defineCollection({
  type: 'content',
  schema: extendedPhotoSchema
});

export const collections = { photos };
```

## CLI Configuration Examples

### Basic CLI Usage

```bash
# Generate all metadata
npx astro-photo-stream

# Only AI metadata
npx astro-photo-stream --ai

# Only location data
npx astro-photo-stream --location

# Batch processing with progress
npx astro-photo-stream --batch --progress --verbose
```

### Custom CLI Configuration

Create `.photostream.config.json`:

```json
{
  "defaultArgs": ["--ai", "--location"],
  "batchSize": 10,
  "concurrency": 3,
  "retryAttempts": 2,
  "outputFormat": "detailed",
  "logLevel": "info"
}
```

## Integration with Other Astro Features

### With Astro Assets

```astro
---
// src/pages/photo/[slug].astro
import { getCollection } from 'astro:content';
import { Image } from 'astro:assets';

const { slug } = Astro.params;
const photo = await getEntry('photos', slug);
---

<Image 
  src={photo.data.coverImage.src}
  alt={photo.data.coverImage.alt}
  width={1920}
  height={1080}
  format="webp"
  quality={85}
/>
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
      <slot />
    </main>
  </body>
</html>
```

### With MDX

```ts
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

```mdx
---
// src/content/photos/photo.mdx
title: "My Amazing Photo"
description: "A detailed story about this photo"
---

import { PhotoCard } from 'astro-photo-stream/components';

# The Story Behind This Photo

This photo was taken during an incredible sunset...

<PhotoCard photo={frontmatter} />

The technical details and story continue...
```

---

These examples should cover most common use cases and provide a solid foundation for customizing the integration to your specific needs.