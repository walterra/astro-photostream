#!/usr/bin/env node

/**
 * Photo Metadata Generator - Standalone version
 * Extracted and adapted from reference implementation at /Users/walterra/dev/walterra-dev
 * 
 * Generates comprehensive photo metadata using:
 * - EXIF data extraction with exifr
 * - AI-powered content generation with Claude API  
 * - Reverse geocoding with OpenCage API
 * - Smart image compression for API uploads
 * - Content collection compatible output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exifr } from 'exifr';
import sharp from 'sharp';
import matter from 'gray-matter';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment variables
const CONFIG = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
  ANTHROPIC_MAX_TOKENS: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '400'),
  OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
  PHOTOS_DIRECTORY: process.env.PHOTOS_DIRECTORY || './src/assets/photos',
  CONTENT_DIRECTORY: process.env.CONTENT_DIRECTORY || './src/content/photo',
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB limit for API
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.tiff', '.tif']
} as const;

// Types aligned with reference implementation
interface ExifData {
  Make?: string;
  Model?: string;
  LensModel?: string;
  FNumber?: number;
  ExposureTime?: number;
  ISO?: number;
  FocalLength?: number;
  FocalLengthIn35mmFormat?: number;
  GPS?: {
    latitude: number;
    longitude: number;
  };
  DateTimeOriginal?: Date;
  DateTime?: Date;
  ImageDescription?: string;
  UserComment?: string;
  XPComment?: string;
  XPSubject?: string;
}

interface AIAnalysisResult {
  title: string;
  description?: string;
  altText: string;
  tags: string[];
}

interface LocationResult {
  name?: string;
  latitude: number;
  longitude: number;
}

interface ProcessedPhoto {
  filename: string;
  exif: ExifData;
  aiAnalysis: AIAnalysisResult;
  location?: LocationResult;
  contentPath: string;
}

// Memory system for AI context (aligned with reference)
let recentLLMOutputs: string[] = [];
const MAX_MEMORY_ITEMS = 5;

// Initialize Anthropic client
const anthropic = CONFIG.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: CONFIG.ANTHROPIC_API_KEY,
}) : null;

/**
 * Extract EXIF data from image file
 * Based on reference implementation patterns
 */
async function extractExifData(imagePath: string): Promise<ExifData> {
  try {
    const exifData = await exifr.parse(imagePath, {
      pick: [
        "Make", "Model", "LensModel", "FNumber", "ExposureTime", "ISO",
        "FocalLengthIn35mmFormat", "FocalLength", "GPS", "DateTimeOriginal", 
        "DateTime", "ImageDescription", "UserComment", "XPComment", "XPSubject"
      ]
    });

    // Extract GPS coordinates if available
    let gpsData;
    if (exifData && (exifData.latitude || exifData.longitude)) {
      const coords = await exifr.gps(imagePath);
      if (coords) {
        gpsData = {
          latitude: coords.latitude,
          longitude: coords.longitude
        };
      }
    }

    return {
      ...exifData,
      GPS: gpsData
    };
  } catch (error) {
    console.warn(`Failed to extract EXIF from ${imagePath}:`, error);
    return {};
  }
}

/**
 * Format camera settings from EXIF data
 * Aligned with reference implementation formatting
 */
function formatCameraSettings(exif: ExifData) {
  const camera = exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : undefined;
  const lens = exif.LensModel;
  
  const settings: any = {};
  
  if (exif.FNumber) {
    settings.aperture = `f/${exif.FNumber}`;
  }
  
  if (exif.ExposureTime) {
    settings.shutter = exif.ExposureTime >= 1 
      ? `${exif.ExposureTime}s`
      : `1/${Math.round(1 / exif.ExposureTime)}s`;
  }
  
  if (exif.ISO) {
    settings.iso = exif.ISO.toString();
  }
  
  if (exif.FocalLengthIn35mmFormat || exif.FocalLength) {
    const focal = exif.FocalLengthIn35mmFormat || exif.FocalLength;
    settings.focalLength = `${focal}mm`;
  }

  return { camera, lens, settings: Object.keys(settings).length > 0 ? settings : undefined };
}

/**
 * Compress image for API upload
 * Progressive compression strategy from reference implementation
 */
async function compressImageForAPI(imagePath: string): Promise<{ buffer: Buffer; size: number } | null> {
  try {
    const originalBuffer = await fs.promises.readFile(imagePath);
    let compressedBuffer = originalBuffer;
    
    // Progressive compression strategy
    let quality = 85;
    let maxWidth = 1920;
    
    while (compressedBuffer.length > CONFIG.MAX_IMAGE_SIZE && quality > 15) {
      compressedBuffer = await sharp(originalBuffer)
        .resize(maxWidth, maxWidth, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
      
      if (compressedBuffer.length > CONFIG.MAX_IMAGE_SIZE) {
        quality -= 15;
        if (quality <= 20) {
          maxWidth = Math.floor(maxWidth * 0.8);
          quality = 85;
        }
      }
    }
    
    return {
      buffer: compressedBuffer,
      size: compressedBuffer.length
    };
  } catch (error) {
    console.warn(`Failed to compress image ${imagePath}:`, error);
    return null;
  }
}

/**
 * Generate AI metadata using Claude API
 * Based on reference implementation prompt and logic
 */
async function generateAIMetadata(
  imagePath: string, 
  filename: string, 
  exif: ExifData
): Promise<AIAnalysisResult> {
  // Fallback analysis based on filename
  const fallbackAnalysis = {
    title: filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    description: `A photograph captured${exif.DateTimeOriginal ? ` on ${exif.DateTimeOriginal.toLocaleDateString()}` : ''}.`,
    altText: `Photograph: ${filename}`,
    tags: ['photography']
  };

  if (!anthropic) {
    console.warn('Claude API not configured, using filename-based analysis');
    return fallbackAnalysis;
  }

  try {
    const compressed = await compressImageForAPI(imagePath);
    if (!compressed) {
      console.warn('Failed to compress image, using filename-based analysis');
      return fallbackAnalysis;
    }

    const base64Image = compressed.buffer.toString('base64');
    
    // Build context from recent outputs (memory system)
    const contextNote = recentLLMOutputs.length > 0
      ? `Recent outputs to avoid repetition: ${recentLLMOutputs.join(', ')}`
      : '';

    // Camera context
    const cameraInfo = exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : '';
    const isSmartphone = cameraInfo.toLowerCase().includes('iphone') || 
                        cameraInfo.toLowerCase().includes('pixel') ||
                        cameraInfo.toLowerCase().includes('samsung');

    // Build comprehensive prompt (aligned with reference)
    const prompt = `You are analyzing a photograph for a photography blog. 

${contextNote ? `CONTEXT: ${contextNote}\n` : ''}
Camera: ${cameraInfo || 'Unknown'}
${isSmartphone ? '(Smartphone camera)' : '(Dedicated camera)'}

Generate JSON with these fields:
- title: 30-60 chars, witty/nerdy, can include puns, SEO-friendly
- description: 200-250 chars, nerdy sarcastic tone, engaging
- altText: Concise accessibility description
- tags: Array of relevant tags (include year if determinable)

Write in Walter's voice: nerdy, slightly sarcastic, humble about photography skills, appreciates technical and artistic aspects.

Focus on what makes this photo interesting or worth sharing.`;

    const message = await anthropic.messages.create({
      model: CONFIG.ANTHROPIC_MODEL,
      max_tokens: CONFIG.ANTHROPIC_MAX_TOKENS,
      temperature: 0.9,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    // Extract and parse JSON response
    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                     responseText.match(/```\n([\s\S]*?)\n```/) ||
                     responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Update memory system
      recentLLMOutputs.push(parsed.title);
      if (recentLLMOutputs.length > MAX_MEMORY_ITEMS) {
        recentLLMOutputs.shift();
      }
      
      return {
        title: parsed.title || fallbackAnalysis.title,
        description: parsed.description,
        altText: parsed.altText || fallbackAnalysis.altText,
        tags: Array.isArray(parsed.tags) ? parsed.tags : fallbackAnalysis.tags
      };
    }

    console.warn('Failed to parse AI response, using fallback');
    return fallbackAnalysis;
    
  } catch (error) {
    console.warn(`AI analysis failed for ${filename}:`, error);
    return fallbackAnalysis;
  }
}

/**
 * Reverse geocode coordinates to location name
 * Based on reference implementation with OpenCage API
 */
async function reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
  if (!CONFIG.OPENCAGE_API_KEY) {
    console.warn('OpenCage API key not configured');
    return undefined;
  }

  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${CONFIG.OPENCAGE_API_KEY}&language=en&no_annotations=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;
      
      // Privacy-focused location extraction (no roads, prioritize landmarks)
      const parts: string[] = [];
      
      // Highest priority: landmarks and geographic features
      if (components.attraction) {
        parts.push(components.attraction);
      } else if (components.mountain) {
        parts.push(components.mountain);
      } else if (components.peak) {
        parts.push(components.peak);
      }
      
      // Settlement hierarchy
      if (components.hamlet) {
        parts.push(components.hamlet);
      } else if (components.village) {
        parts.push(components.village);
      } else if (components.town) {
        parts.push(components.town);
      } else if (components.city) {
        parts.push(components.city);
      }
      
      // Administrative regions
      if (components.state && components.country !== 'United States') {
        parts.push(components.state);
      }
      if (components.country) {
        parts.push(components.country);
      }
      
      return parts.length > 0 ? parts.join(', ') : undefined;
    }
  } catch (error) {
    console.warn(`Geocoding failed for ${latitude}, ${longitude}:`, error);
  }

  return undefined;
}

/**
 * Generate content file for photo
 * Creates markdown file with frontmatter aligned with reference schema
 */
async function generateContentFile(photo: ProcessedPhoto): Promise<void> {
  const { exif, aiAnalysis, location, filename } = photo;
  const { camera, lens, settings } = formatCameraSettings(exif);

  // Generate publish date from EXIF or current date
  const publishDate = exif.DateTimeOriginal || exif.DateTime || new Date();
  
  // Generate content filename with date prefix (reference pattern)
  const dateStr = publishDate.toISOString().split('T')[0];
  const baseFilename = path.parse(filename).name;
  const contentFilename = `${dateStr}_${baseFilename}.md`;
  const contentPath = path.join(CONFIG.CONTENT_DIRECTORY, contentFilename);

  // Ensure content directory exists
  await fs.promises.mkdir(path.dirname(contentPath), { recursive: true });

  // Build frontmatter
  const frontmatter: any = {
    title: aiAnalysis.title,
    publishDate: publishDate.toISOString().split('T')[0],
    coverImage: {
      alt: aiAnalysis.altText,
      src: `../../assets/photos/${filename}`
    },
    tags: aiAnalysis.tags,
    draft: false
  };

  if (aiAnalysis.description) {
    frontmatter.description = aiAnalysis.description;
  }

  if (camera) {
    frontmatter.camera = camera;
  }

  if (lens) {
    frontmatter.lens = lens;
  }

  if (settings) {
    frontmatter.settings = settings;
  }

  if (location) {
    frontmatter.location = {
      latitude: location.latitude,
      longitude: location.longitude,
      ...(location.name && { name: location.name })
    };
  }

  // Generate markdown content
  const content = aiAnalysis.description 
    ? `${aiAnalysis.description}\n\n<!-- Add additional context or story about this photo here -->`
    : '<!-- Add description or story about this photo here -->';

  const fileContent = matter.stringify(content, frontmatter);

  // Write content file
  await fs.promises.writeFile(contentPath, fileContent, 'utf8');
  photo.contentPath = contentPath;

  console.log(`✅ Generated: ${contentFilename}`);
}

/**
 * Process single photo file
 */
async function processPhoto(imagePath: string): Promise<ProcessedPhoto | null> {
  const filename = path.basename(imagePath);
  
  console.log(`🔍 Processing: ${filename}`);

  try {
    // Extract EXIF data
    const exif = await extractExifData(imagePath);
    
    // Generate AI metadata
    const aiAnalysis = await generateAIMetadata(imagePath, filename, exif);
    
    // Process location if GPS data available
    let location: LocationResult | undefined;
    if (exif.GPS) {
      const locationName = await reverseGeocode(exif.GPS.latitude, exif.GPS.longitude);
      location = {
        latitude: exif.GPS.latitude,
        longitude: exif.GPS.longitude,
        name: locationName
      };
    }

    const processedPhoto: ProcessedPhoto = {
      filename,
      exif,
      aiAnalysis,
      location,
      contentPath: ''
    };

    // Generate content file
    await generateContentFile(processedPhoto);

    return processedPhoto;
  } catch (error) {
    console.error(`❌ Failed to process ${filename}:`, error);
    return null;
  }
}

/**
 * Find all photo files in directory
 */
async function findPhotoFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(directory, { recursive: true });
    return files
      .map(file => path.join(directory, file.toString()))
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return CONFIG.SUPPORTED_FORMATS.includes(ext);
      });
  } catch (error) {
    console.error(`Failed to read directory ${directory}:`, error);
    return [];
  }
}

/**
 * Main processing function
 */
async function main() {
  console.log('🚀 Astro Photo Stream - Metadata Generator');
  console.log('========================================\n');

  // Validate configuration
  console.log('Configuration:');
  console.log(`📁 Photos: ${CONFIG.PHOTOS_DIRECTORY}`);
  console.log(`📄 Content: ${CONFIG.CONTENT_DIRECTORY}`);
  console.log(`🤖 Claude API: ${CONFIG.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🗺️ OpenCage API: ${CONFIG.OPENCAGE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');

  // Find photo files
  const photoFiles = await findPhotoFiles(CONFIG.PHOTOS_DIRECTORY);
  
  if (photoFiles.length === 0) {
    console.log(`No photo files found in ${CONFIG.PHOTOS_DIRECTORY}`);
    process.exit(0);
  }

  console.log(`Found ${photoFiles.length} photo(s) to process\n`);

  // Process each photo
  let processed = 0;
  let failed = 0;

  for (const [index, photoPath] of photoFiles.entries()) {
    console.log(`[${index + 1}/${photoFiles.length}]`);
    
    const result = await processPhoto(photoPath);
    if (result) {
      processed++;
    } else {
      failed++;
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 Processing Complete');
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Content files created in: ${CONFIG.CONTENT_DIRECTORY}`);
}

// CLI handling
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { processPhoto, generateAIMetadata, extractExifData, reverseGeocode };