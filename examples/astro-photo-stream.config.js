/**
 * Astro Photo Stream Configuration Example
 * 
 * This file shows all available configuration options with detailed comments.
 * Copy this file to your project root and customize as needed.
 */

export default {
  // Enable/disable the entire integration
  enabled: true,
  
  // Photo processing options
  photos: {
    // Directory containing your photo content
    directory: 'src/content/photos',
    
    // Supported image formats for processing
    formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    
    // Maximum dimensions for image optimization
    maxWidth: 1920,
    maxHeight: 1080,
    
    // Image quality (1-100, higher = better quality but larger files)
    quality: 85
  },
  
  // AI-powered metadata generation
  ai: {
    // Enable AI features (requires API key)
    enabled: true,
    
    // AI provider: 'claude', 'openai', or 'custom'
    provider: 'claude',
    
    // API key (use environment variable for security)
    apiKey: process.env.CLAUDE_API_KEY,
    
    // Model to use for generation
    model: 'claude-3-sonnet-20240229',
    
    // Custom prompt template for AI analysis
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
  
  // Geolocation processing and privacy
  geolocation: {
    // Enable location processing from EXIF GPS data
    enabled: true,
    
    // Privacy protection settings
    privacy: {
      // Enable privacy features
      enabled: true,
      
      // Blur radius in meters for location privacy
      radius: 1000,
      
      // Privacy method: 'blur', 'offset', or 'disable'
      // - blur: Reduces precision within radius
      // - offset: Randomly shifts coordinates
      // - disable: Removes location data entirely
      method: 'blur'
    }
  },
  
  // Photo gallery display options
  gallery: {
    // Number of photos per page
    itemsPerPage: 20,
    
    // Responsive grid columns
    gridCols: {
      mobile: 2,   // Phones
      tablet: 3,   // Tablets
      desktop: 4   // Desktop screens
    },
    
    // Show interactive maps with photo locations
    enableMap: true,
    
    // Enable tag-based filtering and navigation
    enableTags: true,
    
    // Enable search functionality (future feature)
    enableSearch: false
  },
  
  // SEO and social media optimization
  seo: {
    // Generate dynamic OpenGraph images for social sharing
    generateOpenGraph: true,
    
    // Site name for metadata
    siteName: 'My Photography Site',
    
    // Twitter handle for social cards
    twitterHandle: '@myphotos'
  }
};