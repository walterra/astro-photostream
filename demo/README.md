# Astro Photo Stream Demo

This is a demo site showcasing the capabilities of the **astro-photo-stream** integration.

## 🚀 Features Demonstrated

- **Zero-config setup** - Works out of the box with minimal configuration
- **Responsive photo galleries** - 2/3/4 column layouts that adapt to all screen sizes
- **EXIF metadata extraction** - Camera settings, GPS coordinates, and timestamps
- **Tag-based navigation** - Automatic organization and filtering by photo tags
- **SEO optimization** - Dynamic OpenGraph images and structured data
- **Performance optimization** - Static generation, lazy loading, and image optimization

## 🛠️ Running the Demo

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Demo Content

The demo includes sample photos showcasing various photography genres:

- 🏔️ **Landscape Photography** - Mountain vistas and natural scenes
- 🌊 **Seascape Photography** - Ocean waves and coastal views  
- 🌲 **Nature Photography** - Forest paths and wilderness scenes
- 🏙️ **Urban Photography** - City skylines and architecture
- ⭐ **Astrophotography** - Night sky and star photography
- 🍂 **Seasonal Photography** - Autumn colors and reflections

## 🔧 Configuration

The demo uses a comprehensive configuration showcasing all available features:

```js
photoStream({
  photos: {
    directory: 'src/content/photos',
    formats: ['jpg', 'jpeg', 'png', 'webp'],
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85
  },
  gallery: {
    itemsPerPage: 12,
    gridCols: {
      mobile: 2,
      tablet: 3,
      desktop: 4
    },
    enableMap: true,
    enableTags: true
  },
  seo: {
    generateOpenGraph: true,
    siteName: 'Astro Photo Stream Demo'
  }
})
```

## 🌐 Routes

The integration automatically creates these routes:

- `/` - Homepage with feature overview
- `/about` - About page explaining the demo
- `/photos` - Main photo gallery (paginated)
- `/photos/[slug]` - Individual photo pages
- `/photos/tags/[tag]` - Tag-based filtering

## 🔗 Links

- [GitHub Repository](https://github.com/walterra/astro-photostream)
- [Documentation](https://github.com/walterra/astro-photostream#readme)
- [Astro Integration Directory](https://astro.build/integrations)

## 📄 License

MIT License - see the main repository for details.