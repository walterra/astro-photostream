/**
 * Photography Blog Configuration
 * 
 * Optimized for a photography blog with AI-powered metadata,
 * location features, and SEO optimization.
 */

export default {
  // AI metadata generation for automatic descriptions
  ai: {
    enabled: true,
    provider: 'claude',
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-3-sonnet-20240229',
    prompt: `Analyze this photograph for a photography blog. Provide:

**Title**: An engaging, blog-appropriate title that would work as a post headline (under 60 chars)

**Description**: Write 2-3 sentences as if describing the photo to blog readers:
- What the photo shows and where it was taken
- What makes it interesting or noteworthy
- Technical or artistic elements worth highlighting

**Tags**: 5 specific tags for blog categorization:
- Photography genre/style
- Subject matter
- Location type (if applicable)  
- Mood or atmosphere
- Technical aspect (if notable)

Write in a friendly, engaging tone suitable for photography enthusiasts.`
  },
  
  // Location features with moderate privacy
  geolocation: {
    enabled: true,
    privacy: {
      enabled: true,
      radius: 1500, // 1.5km blur for general areas
      method: 'blur'
    }
  },
  
  // Blog-optimized gallery settings
  gallery: {
    itemsPerPage: 12, // Good balance for blog pagination
    gridCols: {
      mobile: 1,   // Single column on mobile for readability
      tablet: 2,   // Two columns on tablet
      desktop: 3   // Three columns on desktop
    },
    enableMap: true,
    enableTags: true
  },
  
  // Strong SEO for blog discoverability
  seo: {
    generateOpenGraph: true,
    siteName: 'Photography Adventures Blog',
    twitterHandle: '@photoblog'
  },
  
  // High quality images for blog
  photos: {
    quality: 88,
    maxWidth: 1920,
    maxHeight: 1080
  }
};