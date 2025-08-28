# Plain Astro Demo Project

A clean, minimal Astro.js project with Tailwind CSS, ready for integrations and customization. This serves as a starting point before adding specialized integrations like `astro-photostream`.

## What's Included

- ⚡ **Astro 5.x** - Modern static site framework
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first layout
- 🚀 **Development Ready** - Hot reload and TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (recommended) or npm

### Installation

1. **Clone or copy this demo project**
2. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser:** Visit `http://localhost:4321`

## Adding astro-photostream Integration

Transform this plain Astro project into a photo gallery with AI metadata features:

### Step 1: Install the Integration

#### For Published Package (Recommended)

```bash
npx astro add astro-photostream
```

This command will:

- Install the `astro-photostream` package
- Update your `astro.config.mjs` automatically
- Set up the necessary configuration

#### For Local Development

**⚠️ Current Status:** The astro-photostream integration is currently in development and has several build issues that need to be resolved before it can be used locally.

When the integration is ready, the installation process will be:

```bash
# First, build the main package (from parent directory)
cd ../
pnpm build

# Then install from local package
cd demo/
pnpm add ../
# or
npm install ../
```

Then manually add to your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import photoStream from 'astro-photostream';

export default defineConfig({
  integrations: [
    tailwind(),
    photoStream({}), // Pass empty object for default options
  ],
});
```

### Step 2: Configure Content Collections

Update your `src/content/config.ts` file:

```ts
import { defineCollection } from 'astro:content';
import { photoSchema } from 'astro-photostream/schema';

const photos = defineCollection({
  type: 'content',
  schema: photoSchema,
});

export const collections = { photos };
```

### Step 3: Get Sample Photos (Optional)

For a quick start with sample photos, you can fetch Creative Commons photos from Wikimedia Commons:

```bash
pnpm fetch-photos
# or
npm run fetch-photos
```

This script will:

- **Fetch high-quality Creative Commons photos** from Wikimedia Featured Pictures and Quality Images
- **Filter for geolocated images** with GPS coordinates embedded in EXIF data
- **Download ~20-50 photos** (depending on availability) to `src/assets/photos/`
- **Use deterministic sorting** (timestamp-based) for reproducible results
- **Handle network errors** gracefully with retry logic

The fetched photos are perfect for testing the integration's AI metadata generation and geolocation features.

### Step 4: Add Your Photos

The photo system uses two separate directories:

- **`src/assets/photos/`** - Store your actual image files (.jpg, .png, etc.)
- **`src/content/photos/`** - Store metadata files (.md) that reference the images

Example structure:

```
src/
├── assets/photos/          # Actual image files
│   ├── sunset-beach.jpg
│   └── mountain-hike.jpg
└── content/photos/         # Metadata files
    ├── sunset-beach.md
    └── mountain-hike.md
```

### Step 5: Create Photo Entries

Example photo entry (`src/content/photos/sunset-beach.md`):

```markdown
---
title: 'Golden Hour at the Beach'
description: 'Stunning sunset over the Pacific Ocean'
coverImage:
  src: '../../assets/photos/sunset-beach.jpg'
  alt: 'Golden sunset over ocean waves'
tags: ['sunset', 'beach', 'golden-hour']
publishDate: 2024-08-15
location:
  name: 'Malibu Beach, California'
  latitude: 34.0259
  longitude: -118.7798
draft: false
---

A perfect evening capturing the golden hour at Malibu Beach.
```

### Step 6: Advanced Configuration (Optional)

For AI metadata and geolocation features, add to your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import photoStream from 'astro-photostream';

export default defineConfig({
  integrations: [
    tailwind(),
    photoStream({
      ai: {
        enabled: true,
        provider: 'claude',
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      geolocation: {
        enabled: true,
        privacy: {
          enabled: true,
          radius: 1000, // Blur location within 1km
        },
      },
      gallery: {
        itemsPerPage: 20,
        enableTags: true,
        enableMap: true,
      },
    }),
  ],
});
```

### Step 7: Environment Variables (Optional)

For full AI and geolocation features, create a `.env` file:

```bash
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENCAGE_API_KEY=your_opencage_api_key_here
GEOAPIFY_API_KEY=your_geoapify_api_key_here
```

### Step 8: Access Your Photo Gallery

After installation, your photo gallery will be available at:

- **Main Gallery:** `/photos`
- **Individual Photos:** `/photos/[photo-slug]`
- **Tag Filtering:** `/photos/tags/[tag-name]`

## Available Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Run Astro type checking

# Sample content
pnpm fetch-photos # Download 20-50 Creative Commons photos with GPS data

# After adding astro-photostream
pnpm photo-metadata-generator --generate-config  # Create configuration file
pnpm photo-metadata-generator                     # Generate metadata for photos
```

## What Changes After Adding astro-photostream?

The integration will automatically:

1. **Add photo routes** (`/photos`, `/photos/[slug]`, etc.)
2. **Inject photo components** (PhotoGrid, PhotoCard, etc.)
3. **Enable content collections** with photo schema
4. **Provide AI metadata generation** (if configured)
5. **Add geolocation features** with privacy controls
6. **Include interactive maps** and OpenGraph image generation

## Learn More

- **Astro Documentation:** [astro.build](https://astro.build)
- **astro-photostream:** [GitHub Repository](https://github.com/walterra/astro-photostream)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages
│   │   ├── index.astro  # Homepage
│   │   └── about.astro  # About page
│   └── content/         # Content collections
│       └── config.ts    # Content schema config
├── astro.config.mjs     # Astro configuration
├── package.json         # Dependencies
└── tailwind.config.mjs  # Tailwind configuration
```

---

This demo provides a clean foundation for building with Astro. Add integrations and customize as needed for your specific use case!
