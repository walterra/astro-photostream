/**
 * Performance Optimized Configuration
 * 
 * Optimized for fast loading and minimal resource usage.
 * Great for high-traffic sites or mobile-first experiences.
 */

export default {
  // Optimized image settings
  photos: {
    formats: ['webp', 'avif', 'jpg'], // Modern formats first
    quality: 78,    // Balanced quality/size ratio
    maxWidth: 1600, // Reasonable max size
    maxHeight: 1200
  },
  
  // Performance-focused gallery
  gallery: {
    itemsPerPage: 25,    // More items per page = fewer page loads
    gridCols: {
      mobile: 2,    // Optimized for mobile
      tablet: 3,
      desktop: 4
    },
    enableMap: false,     // Disable resource-intensive maps
    enableTags: true,     // Lightweight feature
    enableSearch: false   // Avoid search overhead
  },
  
  // Disable AI for faster builds
  ai: {
    enabled: false
  },
  
  // Minimal geolocation processing
  geolocation: {
    enabled: false // Skip location processing entirely
  },
  
  // Basic SEO without heavy features
  seo: {
    generateOpenGraph: false, // Skip OG image generation
    siteName: 'Fast Photo Gallery'
  }
};