/**
 * OpenGraph Image Generation Endpoint
 * Generates dynamic OG images for individual photos
 * Based on reference implementation patterns
 */
import { getCollection, getEntry } from 'astro:content';
import { config } from 'virtual:astro-photostream/config';
import sharp from 'sharp';
import type { APIContext, GetStaticPaths } from 'astro';

// Generate static paths for all photos
export const getStaticPaths: GetStaticPaths = async () => {
  // Get all photos from content collection
  const allPhotos = await getCollection('photos', ({ data }) => {
    return data.draft !== true;
  });

  return allPhotos.map(photo => ({
    params: { slug: photo.slug },
  }));
};

export async function GET(context: APIContext) {
  try {
    const { slug } = context.params;

    if (!slug) {
      return new Response('Photo not found', { status: 404 });
    }

    // Get the photo entry
    const photo = await getEntry('photos', slug);

    if (!photo) {
      return new Response('Photo not found', { status: 404 });
    }

    // Generate OG image using photo and metadata
    const ogImage = await generateOGImage(photo, config);

    return new Response(ogImage as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': ogImage.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);

    // Return a simple error image
    const errorImage = await generateErrorImage();

    return new Response(errorImage as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache error for 1 hour
      },
    });
  }
}

/**
 * Generate OpenGraph image for a photo
 */
async function generateOGImage(
  photo: unknown,
  config: unknown
): Promise<Buffer> {
  const width = 1200;
  const height = 630;
  const padding = 80;

  // Base colors and styling
  const textColor = '#ffffff';
  const accentColor = '#3b82f6'; // blue

  try {
    // Photo buffer handling would go here if needed

    try {
      // If the photo source is a local path, try to load it
      if (
        typeof photo.data.coverImage.src === 'string' &&
        photo.data.coverImage.src.startsWith('./')
      ) {
        // This would need to be adapted based on how your images are stored
        // For now, we'll create a placeholder
      }
    } catch {
      // Ignore photo loading errors, we'll create a text-only OG image
    }

    // Create base image
    let image = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 31, g: 41, b: 55, alpha: 1 }, // backgroundColor
      },
    });

    // SVG overlay with text and design elements
    const svgOverlay = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:0.2" />
          </linearGradient>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.05)"/>
          </pattern>
        </defs>
        
        <!-- Background pattern -->
        <rect width="100%" height="100%" fill="url(#dots)" />
        <rect width="100%" height="100%" fill="url(#gradient)" />
        
        <!-- Decorative camera icon -->
        <g transform="translate(${width - 150}, 50)" fill="rgba(255,255,255,0.1)">
          <rect x="10" y="20" width="60" height="40" rx="8" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
          <circle cx="40" cy="40" r="12" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
          <circle cx="40" cy="40" r="6" fill="rgba(255,255,255,0.1)"/>
          <rect x="20" y="15" width="15" height="8" rx="2" fill="rgba(255,255,255,0.1)"/>
        </g>
        
        <!-- Main content area -->
        <foreignObject x="${padding}" y="${padding}" width="${width - padding * 2}" height="${height - padding * 2}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: ${textColor};
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          ">
            <!-- Photo title -->
            <h1 style="
              font-size: 48px;
              font-weight: 700;
              line-height: 1.1;
              margin: 0 0 20px 0;
              max-width: 800px;
              word-wrap: break-word;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            ">${escapeHtml(photo.data.title)}</h1>
            
            ${
              photo.data.description
                ? `
            <!-- Photo description -->
            <p style="
              font-size: 24px;
              line-height: 1.4;
              margin: 0 0 30px 0;
              color: rgba(255, 255, 255, 0.8);
              max-width: 700px;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            ">${escapeHtml(photo.data.description)}</p>
            `
                : ''
            }
            
            <!-- Metadata row -->
            <div style="
              display: flex;
              flex-wrap: wrap;
              gap: 30px;
              align-items: center;
              font-size: 18px;
              color: rgba(255, 255, 255, 0.7);
            ">
              ${
                photo.data.camera
                  ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: ${accentColor};">📷</span>
                  <span>${escapeHtml(photo.data.camera)}</span>
                </div>
              `
                  : ''
              }
              
              ${
                photo.data.location?.name
                  ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: ${accentColor};">📍</span>
                  <span>${escapeHtml(photo.data.location.name)}</span>
                </div>
              `
                  : ''
              }
              
              ${
                photo.data.tags.length > 0
                  ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: ${accentColor};">#</span>
                  <span>${escapeHtml(photo.data.tags.slice(0, 3).join(', '))}</span>
                </div>
              `
                  : ''
              }
            </div>
            
            <!-- Site branding -->
            <div style="
              position: absolute;
              bottom: 30px;
              right: 30px;
              font-size: 16px;
              color: rgba(255, 255, 255, 0.6);
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              ${
                config.seo.siteName
                  ? `
                <span>${escapeHtml(config.seo.siteName)}</span>
              `
                  : `
                <span>Photo Gallery</span>
              `
              }
              <span style="color: ${accentColor};">•</span>
              <span>astro-photostream</span>
            </div>
          </div>
        </foreignObject>
      </svg>
    `;

    // Apply the SVG overlay
    image = image.composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ]);

    // Convert to PNG
    const buffer = await image.png({ quality: 90 }).toBuffer();

    return buffer;
  } catch (error) {
    console.error('Error in generateOGImage:', error);
    throw error;
  }
}

/**
 * Generate a simple error image
 */
async function generateErrorImage(): Promise<Buffer> {
  const width = 1200;
  const height = 630;

  const svgError = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1f2937"/>
      <foreignObject x="0" y="0" width="${width}" height="${height}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #ffffff;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">📷</div>
          <h1 style="font-size: 42px; font-weight: 700; margin: 0 0 15px 0;">Photo Gallery</h1>
          <p style="font-size: 20px; color: rgba(255, 255, 255, 0.7); margin: 0;">Powered by Astro Photo Stream</p>
        </div>
      </foreignObject>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svgError))
    .png({ quality: 90 })
    .toBuffer();

  return buffer;
}

/**
 * Escape HTML entities in text
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, m => map[m]);
}
