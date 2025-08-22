/**
 * Portfolio Configuration
 * 
 * Optimized for a professional photography portfolio
 * with high-quality images and minimal distractions.
 */

export default {
  // High-quality images for portfolio presentation
  photos: {
    quality: 95,     // Maximum quality for portfolio
    maxWidth: 2560,  // Support high-resolution displays
    maxHeight: 1440,
    formats: ['webp', 'avif', 'jpg'] // Modern formats for performance
  },
  
  // Portfolio-focused gallery layout
  gallery: {
    itemsPerPage: 9, // Grid layout works well with 9 items
    gridCols: {
      mobile: 1,   // Single column for mobile focus
      tablet: 2,   // Two columns on tablet
      desktop: 3   // Clean 3x3 grid on desktop
    },
    enableMap: false,    // Focus on photos, not locations
    enableTags: true,    // Keep tags for organization
    enableSearch: false  // Keep it simple
  },
  
  // Minimal AI prompts focused on artistic description
  ai: {
    enabled: true,
    provider: 'claude',
    apiKey: process.env.CLAUDE_API_KEY,
    prompt: `Analyze this photograph for a professional portfolio. Provide:

**Title**: A sophisticated, artistic title that reflects the creative vision (under 50 chars)

**Description**: Write 1-2 sentences focusing on:
- The artistic or emotional impact
- Technical excellence or creative technique
- What makes this image portfolio-worthy

**Tags**: 3-4 refined tags:
- Photography genre
- Artistic style or technique
- Subject/theme
- Mood or aesthetic

Keep the tone professional and artistic, suitable for a photographer's portfolio.`
  },
  
  // Privacy for client work
  geolocation: {
    enabled: false // Disable location data for privacy
  },
  
  // Professional SEO
  seo: {
    generateOpenGraph: true,
    siteName: 'Professional Photography Portfolio',
    twitterHandle: '@photographer'
  }
};