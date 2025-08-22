/**
 * High Privacy Configuration
 * 
 * Maximum privacy protection for sensitive photography
 * or personal photo collections.
 */

export default {
  // Strict geolocation privacy
  geolocation: {
    enabled: true,
    privacy: {
      enabled: true,
      radius: 10000, // 10km blur radius for maximum privacy
      method: 'offset' // Random offset instead of blur
    }
  },
  
  // Disable location-related features
  gallery: {
    itemsPerPage: 20,
    gridCols: {
      mobile: 2,
      tablet: 3,
      desktop: 4
    },
    enableMap: false,     // No maps to avoid location leaks
    enableTags: true,     // Tags are safe
    enableSearch: false   // Keep it simple
  },
  
  // No automatic social sharing
  seo: {
    generateOpenGraph: false, // No automatic social images
    siteName: 'Private Photo Collection'
    // No social handles for privacy
  },
  
  // Conservative image processing
  photos: {
    quality: 80,     // Good quality but smaller files
    maxWidth: 1600,  // Reasonable size limit
    maxHeight: 1200
  },
  
  // AI disabled to avoid sending images to external services
  ai: {
    enabled: false
  }
};