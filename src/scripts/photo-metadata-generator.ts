#!/usr/bin/env tsx
/**
 * Photo Metadata Generator
 * Aligned with reference implementation from /Users/walterra/dev/walterra-dev
 * 
 * Generates comprehensive photo metadata using:
 * - EXIF data extraction with exifr
 * - AI-powered content generation with Claude API  
 * - Reverse geocoding with OpenCage API
 * - Smart image compression for API uploads
 * - Content collection compatible output
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { exifr } from 'exifr';
import sharp from 'sharp';
import matter from 'gray-matter';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES (aligned with reference)
// ============================================================================

interface ExifData {
    camera?: string;
    lens?: string;
    settings?: {
        aperture?: string;
        shutter?: string;
        iso?: string;
        focalLength?: string;
    };
    location?: {
        name?: string;
        latitude?: number;
        longitude?: number;
    };
    dateTime?: Date;
    caption?: string;
}

interface LLMAnalysis {
    title: string;
    description: string;
    altText: string;
    suggestedTags: string[];
    mood?: string;
    subjects?: string[];
}

interface PhotoMetadata extends ExifData {
    title: string;
    description: string;
    altText: string;
    tags: string[];
    publishDate: string;
    draft: boolean;
}

interface ExistingMetadata {
    frontmatter: Record<string, unknown>;
    content: string;
}

// ============================================================================
// CONFIGURATION (aligned with reference)
// ============================================================================

// Directories
const CONTENT_DIR = process.env.CONTENT_DIRECTORY || './src/content/photo';
const ASSETS_DIR = process.env.PHOTOS_DIRECTORY || './src/assets/photos';

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.tiff', '.tif'];

// Initialize Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

// OpenCage API key
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

// ============================================================================
// MEMORY SYSTEM (aligned with reference)
// ============================================================================

// Memory for recent LLM outputs to avoid repetitive descriptions
const recentLLMOutputs: LLMAnalysis[] = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function question(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// ============================================================================
// CORE PROCESSING FUNCTIONS (aligned with reference)
// ============================================================================

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

        if (!exifData) {
            return {};
        }

        // Format camera information
        const camera = exifData.Make && exifData.Model 
            ? `${exifData.Make} ${exifData.Model}` 
            : undefined;

        // Format settings
        const settings: any = {};
        if (exifData.FNumber) {
            settings.aperture = `f/${exifData.FNumber}`;
        }
        if (exifData.ExposureTime) {
            settings.shutter = exifData.ExposureTime >= 1 
                ? `${exifData.ExposureTime}s`
                : `1/${Math.round(1 / exifData.ExposureTime)}s`;
        }
        if (exifData.ISO) {
            settings.iso = exifData.ISO.toString();
        }
        if (exifData.FocalLengthIn35mmFormat || exifData.FocalLength) {
            const focal = exifData.FocalLengthIn35mmFormat || exifData.FocalLength;
            settings.focalLength = `${focal}mm`;
        }

        // Extract GPS coordinates if available
        let location;
        if (exifData.GPS || (exifData.latitude && exifData.longitude)) {
            try {
                const coords = await exifr.gps(imagePath);
                if (coords) {
                    location = {
                        latitude: coords.latitude,
                        longitude: coords.longitude
                    };
                }
            } catch (error) {
                console.warn('Failed to extract GPS coordinates:', error);
            }
        }

        // Extract description from various EXIF fields
        const description = exifData.ImageDescription || 
                           exifData.UserComment || 
                           exifData.XPComment || 
                           exifData.XPSubject;

        return {
            camera,
            lens: exifData.LensModel,
            settings: Object.keys(settings).length > 0 ? settings : undefined,
            location,
            dateTime: exifData.DateTimeOriginal || exifData.DateTime,
            caption: description
        };
    } catch (error) {
        console.warn(`Failed to extract EXIF from ${imagePath}:`, error);
        return {};
    }
}

/**
 * Compress image for API upload with progressive strategy
 * Based on reference implementation compression logic
 */
async function compressImageForAPI(imagePath: string): Promise<Buffer> {
    // Target ~3.7MB buffer size to account for Base64 encoding overhead (~33%)
    const MAX_BUFFER_SIZE = Math.floor(5 * 1024 * 1024 * 0.75); // ~3.75MB
    
    const originalBuffer = await fs.readFile(imagePath);
    let compressedBuffer: Buffer;
    let quality = 85;
    let maxWidth = 1920;

    // Start with reasonable size and quality
    compressedBuffer = await sharp(originalBuffer)
        .resize(maxWidth, maxWidth, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();

    console.log(`Initial compression: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB`);

    // If still too large, reduce both size and quality progressively
    while (compressedBuffer.length > MAX_BUFFER_SIZE && (quality > 20 || maxWidth > 800)) {
        if (quality > 40) {
            quality -= 15; // Reduce quality more aggressively first
        } else if (maxWidth > 800) {
            maxWidth = Math.floor(maxWidth * 0.8); // Then reduce size
            quality = Math.max(quality, 30); // Reset quality when resizing
        } else {
            quality -= 5; // Final quality reduction
        }

        console.log(`Compressing further: quality=${quality}%, maxWidth=${maxWidth}px`);
        
        compressedBuffer = await sharp(originalBuffer)
            .resize(maxWidth, maxWidth, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality })
            .toBuffer();

        console.log(`New size: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    }

    if (compressedBuffer.length > MAX_BUFFER_SIZE) {
        throw new Error(`Unable to compress image below ${MAX_BUFFER_SIZE} bytes`);
    }

    return compressedBuffer;
}

/**
 * Analyze image content using Claude API
 * Based on reference implementation with Walter's personality
 */
async function analyzeLLMContent(imagePath: string, exifData?: ExifData): Promise<LLMAnalysis> {
    const filename = path.basename(imagePath);
    
    // Fallback analysis for when API is not available
    const fallbackAnalysis: LLMAnalysis = {
        title: filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        description: `A photograph${exifData?.dateTime ? ` captured on ${exifData.dateTime.toLocaleDateString()}` : ''}.`,
        altText: `Photograph: ${filename}`,
        suggestedTags: ['photography', ...(exifData?.dateTime ? [exifData.dateTime.getFullYear().toString()] : [])]
    };

    if (!anthropic) {
        console.warn('Claude API not configured, using filename-based analysis');
        return fallbackAnalysis;
    }

    try {
        // Compress image for API
        const compressedBuffer = await compressImageForAPI(imagePath);
        const base64Image = compressedBuffer.toString('base64');
        
        // Build context from recent outputs (memory system)
        const recentContext = recentLLMOutputs.length > 0
            ? `Recent outputs to avoid repetition: ${recentLLMOutputs.slice(-3).map(r => r.title).join(', ')}`
            : '';

        // Camera context
        const cameraInfo = exifData?.camera || 'Unknown camera';
        const isSmartphone = cameraInfo.toLowerCase().includes('iphone') || 
                            cameraInfo.toLowerCase().includes('pixel') ||
                            cameraInfo.toLowerCase().includes('samsung');

        // Technical context
        const techContext = exifData?.settings ? [
            exifData.settings.aperture,
            exifData.settings.shutter,
            exifData.settings.iso && `ISO ${exifData.settings.iso}`,
            exifData.settings.focalLength
        ].filter(Boolean).join(', ') : '';

        // Build comprehensive prompt (aligned with reference)
        const prompt = `You are analyzing a photograph for Walter's photography blog. 

${recentContext ? `CONTEXT: ${recentContext}\n` : ''}
Filename: ${filename}
Camera: ${cameraInfo}${isSmartphone ? ' (Smartphone camera)' : ' (Dedicated camera)'}
${exifData?.lens ? `Lens: ${exifData.lens}` : ''}
${techContext ? `Settings: ${techContext}` : ''}
${exifData?.location ? `Location: ${exifData.location.latitude?.toFixed(4)}, ${exifData.location.longitude?.toFixed(4)}` : ''}
${exifData?.dateTime ? `Date: ${exifData.dateTime.toLocaleDateString()}` : ''}

Generate JSON with these fields:
- title: 30-60 chars, witty/nerdy, can include puns, SEO-friendly
- description: 200-250 chars, nerdy sarcastic tone, engaging
- altText: Concise accessibility description
- suggestedTags: Array of relevant tags (include year if determinable)

Write in Walter's voice: nerdy, slightly sarcastic, humble about photography skills, appreciates technical and artistic aspects.

Focus on what makes this photo interesting or worth sharing. Avoid generic descriptions.`;

        const message = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
            max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '400'),
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
            
            const analysis: LLMAnalysis = {
                title: parsed.title || fallbackAnalysis.title,
                description: parsed.description || fallbackAnalysis.description,
                altText: parsed.altText || fallbackAnalysis.altText,
                suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : fallbackAnalysis.suggestedTags
            };
            
            // Store this output in recent memory (keep only last 5) with date context
            const analysisWithDate = {
                ...analysis,
                processedDate: exifData?.dateTime || new Date(),
            };
            recentLLMOutputs.push(analysisWithDate);
            if (recentLLMOutputs.length > 5) {
                recentLLMOutputs.shift(); // Remove oldest entry
            }
            
            return analysis;
        }

        console.warn('Failed to parse AI response, using fallback');
        return fallbackAnalysis;
        
    } catch (error) {
        console.warn(`AI analysis failed for ${filename}:`, error);
        return fallbackAnalysis;
    }
}

/**
 * Reverse geocode coordinates to location name using OpenCage API
 * Based on reference implementation with detailed privacy logic
 */
async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
    if (!OPENCAGE_API_KEY) {
        console.warn('OpenCage API key not configured');
        return undefined;
    }

    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&no_annotations=0&no_dedupe=1&language=en&limit=5`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return undefined;
        }

        // Scoring system for result specificity (from reference)
        let bestResult = data.results[0];
        let bestSpecificity = 0;

        for (const result of data.results) {
            const components = result.components;
            let specificity = 0;
            
            // Landmarks and geographic features get highest priority
            if (components.attraction || components.mountain || components.peak) {
                specificity += 12;
            } else if (components.tourism) {
                specificity += 11;
            } else if (components.hamlet) {
                specificity += 10;
            } else if (components.village) {
                specificity += 9;
            } else if (components.suburb) {
                specificity += 8;
            } else if (components.town) {
                specificity += 7;
            } else if (components.city) {
                specificity += 6;
            } else if (components.county) {
                specificity += 4;
            } else if (components.state) {
                specificity += 3;
            } else if (components.country) {
                specificity += 1;
            }
            
            // Boost score based on OpenCage confidence (0-10 scale)
            if (result.confidence) {
                specificity += result.confidence * 0.5;
            }
            
            if (specificity > bestSpecificity) {
                bestSpecificity = specificity;
                bestResult = result;
            }
        }

        const components = bestResult.components;
        
        // Build location string with privacy priority order
        const parts: string[] = [];
        
        // Helper function to get English name
        function getEnglishName(component: any): string | undefined {
            if (typeof component === 'string') {
                return component;
            }
            if (typeof component === 'object' && component !== null) {
                return component.en || component.eng || Object.values(component)[0];
            }
            return undefined;
        }
        
        // Highest priority: landmarks and geographic features (no roads for privacy)
        if (components.attraction) {
            const attraction = getEnglishName(components.attraction);
            if (attraction) parts.push(attraction);
        } else if (components.mountain) {
            const mountain = getEnglishName(components.mountain);
            if (mountain) parts.push(mountain);
        } else if (components.peak) {
            const peak = getEnglishName(components.peak);
            if (peak) parts.push(peak);
        }
        
        // Settlement hierarchy (privacy-focused)
        if (components.hamlet) {
            const hamlet = getEnglishName(components.hamlet);
            if (hamlet) parts.push(hamlet);
        } else if (components.village) {
            const village = getEnglishName(components.village);
            if (village) parts.push(village);
        } else if (components.suburb) {
            const suburb = getEnglishName(components.suburb);
            if (suburb) parts.push(suburb);
        } else if (components.town) {
            const town = getEnglishName(components.town);
            if (town) parts.push(town);
        } else if (components.city) {
            const city = getEnglishName(components.city);
            if (city) parts.push(city);
        }
        
        // Add broader context if specific location found
        if (parts.length > 0) {
            const county = getEnglishName(components.county);
            if (county && !parts.includes(county)) {
                parts.push(county);
            }
        }
        
        // Administrative regions
        // Special handling for US states (don't include state for US)
        if (components.state && components.country !== 'United States') {
            const state = getEnglishName(components.state);
            if (state) parts.push(state);
        }
        
        // Always add country for international context
        if (components.country) {
            const country = getEnglishName(components.country);
            if (country) parts.push(country);
        }
        
        return parts.length > 0 ? parts.join(', ') : undefined;
    } catch (error) {
        console.warn(`Geocoding failed for ${lat}, ${lng}:`, error);
        return undefined;
    }
}

// ============================================================================
// METADATA GENERATION FUNCTIONS (aligned with reference)
// ============================================================================

/**
 * Generate complete metadata for a photo by combining EXIF and LLM data
 */
async function generateMetadata(imagePath: string): Promise<PhotoMetadata> {
    console.log(`🔍 Processing: ${path.basename(imagePath)}`);
    
    // Extract EXIF data
    const exifData = await extractExifData(imagePath);
    
    // Process location if GPS data available
    if (exifData.location) {
        const locationName = await reverseGeocode(exifData.location.latitude!, exifData.location.longitude!);
        if (locationName) {
            exifData.location.name = locationName;
        }
    }
    
    // Generate AI analysis
    const llmAnalysis = await analyzeLLMContent(imagePath, exifData);
    
    // Determine publish date
    const publishDate = exifData.dateTime || new Date();
    
    // Combine all metadata
    return {
        ...exifData,
        title: llmAnalysis.title,
        description: llmAnalysis.description,
        altText: llmAnalysis.altText,
        tags: llmAnalysis.suggestedTags,
        publishDate: publishDate.toISOString().split('T')[0],
        draft: false
    };
}

/**
 * Generate markdown content with frontmatter
 */
function generateMarkdownContent(metadata: PhotoMetadata, imagePath: string): string {
    const filename = path.basename(imagePath);
    
    // Build frontmatter object
    const frontmatter: any = {
        title: metadata.title,
        publishDate: metadata.publishDate,
        coverImage: {
            alt: metadata.altText,
            src: `../../assets/photos/${filename}`
        },
        tags: metadata.tags,
        draft: metadata.draft
    };

    if (metadata.description) {
        frontmatter.description = metadata.description;
    }

    if (metadata.camera) {
        frontmatter.camera = metadata.camera;
    }

    if (metadata.lens) {
        frontmatter.lens = metadata.lens;
    }

    if (metadata.settings) {
        frontmatter.settings = metadata.settings;
    }

    if (metadata.location) {
        frontmatter.location = {
            latitude: metadata.location.latitude,
            longitude: metadata.location.longitude,
            ...(metadata.location.name && { name: metadata.location.name })
        };
    }

    // Generate content body
    const content = metadata.description 
        ? `${metadata.description}\n\n<!-- Add additional context or story about this photo here -->`
        : '<!-- Add description or story about this photo here -->';

    return matter.stringify(content, frontmatter);
}

/**
 * Generate content filename with date prefix
 */
function generateFilename(metadata: PhotoMetadata, imagePath: string): string {
    const originalFilename = path.parse(imagePath).name;
    return `${metadata.publishDate}_${originalFilename}.md`;
}

// ============================================================================
// FILE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Find all image files recursively in a directory
 */
async function findImageFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                const subFiles = await findImageFiles(fullPath);
                files.push(...subFiles);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.error(`Failed to read directory ${dir}:`, error);
    }
    
    return files;
}

/**
 * Check if metadata file already exists for image
 */
async function hasMetadataFile(imagePath: string): Promise<boolean> {
    try {
        // We need to generate metadata first to get the correct filename
        const exifData = await extractExifData(imagePath);
        const publishDate = exifData.dateTime || new Date();
        const dateStr = publishDate.toISOString().split('T')[0];
        const originalFilename = path.parse(imagePath).name;
        const metadataFilename = `${dateStr}_${originalFilename}.md`;
        const metadataPath = path.join(CONTENT_DIR, metadataFilename);
        
        await fs.access(metadataPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Process a single image file
 */
async function processImage(imagePath: string, force = false): Promise<void> {
    // Check if metadata already exists
    if (!force && await hasMetadataFile(imagePath)) {
        console.log(`⏭️  Skipping ${path.basename(imagePath)} (metadata exists)`);
        return;
    }
    
    try {
        // Generate metadata
        const metadata = await generateMetadata(imagePath);
        
        // Generate content
        const markdownContent = generateMarkdownContent(metadata, imagePath);
        const filename = generateFilename(metadata, imagePath);
        const outputPath = path.join(CONTENT_DIR, filename);
        
        // Ensure output directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        
        // Write file
        await fs.writeFile(outputPath, markdownContent, 'utf8');
        
        console.log(`✅ Generated: ${filename}`);
    } catch (error) {
        console.error(`❌ Failed to process ${path.basename(imagePath)}:`, error);
    }
}

// ============================================================================
// UPDATE FUNCTIONS (from reference)
// ============================================================================

/**
 * Parse existing metadata file
 */
async function parseExistingMetadata(filePath: string): Promise<ExistingMetadata | null> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const parsed = matter(fileContent);
        return {
            frontmatter: parsed.data,
            content: parsed.content
        };
    } catch (error) {
        console.warn(`Failed to parse existing metadata ${filePath}:`, error);
        return null;
    }
}

/**
 * Update only EXIF fields in existing metadata files
 */
async function updateExifFields(imagePath: string): Promise<void> {
    const filename = path.basename(imagePath);
    console.log(`🔄 Updating EXIF for: ${filename}`);
    
    try {
        // Find existing metadata file
        const exifData = await extractExifData(imagePath);
        const publishDate = exifData.dateTime || new Date();
        const dateStr = publishDate.toISOString().split('T')[0];
        const originalFilename = path.parse(imagePath).name;
        const metadataFilename = `${dateStr}_${originalFilename}.md`;
        const metadataPath = path.join(CONTENT_DIR, metadataFilename);
        
        const existingMetadata = await parseExistingMetadata(metadataPath);
        if (!existingMetadata) {
            console.log(`⏭️  No existing metadata found for ${filename}`);
            return;
        }
        
        // Update only EXIF-related fields
        const updatedFrontmatter = {
            ...existingMetadata.frontmatter,
            ...(exifData.camera && { camera: exifData.camera }),
            ...(exifData.lens && { lens: exifData.lens }),
            ...(exifData.settings && { settings: exifData.settings }),
        };
        
        // Regenerate content with updated frontmatter
        const updatedContent = matter.stringify(existingMetadata.content, updatedFrontmatter);
        await fs.writeFile(metadataPath, updatedContent, 'utf8');
        
        console.log(`✅ Updated EXIF: ${metadataFilename}`);
    } catch (error) {
        console.error(`❌ Failed to update EXIF for ${filename}:`, error);
    }
}

/**
 * Update only location strings in existing metadata files
 */
async function updateLocationStrings(imagePath: string): Promise<void> {
    const filename = path.basename(imagePath);
    console.log(`🗺️  Updating location for: ${filename}`);
    
    try {
        // Extract GPS coordinates
        const exifData = await extractExifData(imagePath);
        if (!exifData.location) {
            console.log(`⏭️  No GPS data for ${filename}`);
            return;
        }
        
        // Get location name
        const locationName = await reverseGeocode(exifData.location.latitude!, exifData.location.longitude!);
        if (!locationName) {
            console.log(`⏭️  No location name found for ${filename}`);
            return;
        }
        
        // Find existing metadata file
        const publishDate = exifData.dateTime || new Date();
        const dateStr = publishDate.toISOString().split('T')[0];
        const originalFilename = path.parse(imagePath).name;
        const metadataFilename = `${dateStr}_${originalFilename}.md`;
        const metadataPath = path.join(CONTENT_DIR, metadataFilename);
        
        const existingMetadata = await parseExistingMetadata(metadataPath);
        if (!existingMetadata) {
            console.log(`⏭️  No existing metadata found for ${filename}`);
            return;
        }
        
        // Update location information
        const existingLocation = existingMetadata.frontmatter.location as any || {};
        const updatedFrontmatter = {
            ...existingMetadata.frontmatter,
            location: {
                ...existingLocation,
                name: locationName,
                latitude: exifData.location.latitude,
                longitude: exifData.location.longitude
            }
        };
        
        // Regenerate content with updated frontmatter
        const updatedContent = matter.stringify(existingMetadata.content, updatedFrontmatter);
        await fs.writeFile(metadataPath, updatedContent, 'utf8');
        
        console.log(`✅ Updated location: ${metadataFilename} (${locationName})`);
    } catch (error) {
        console.error(`❌ Failed to update location for ${filename}:`, error);
    }
}

// ============================================================================
// MAIN FUNCTION AND CLI HANDLING
// ============================================================================

async function main() {
    console.log('🚀 Astro Photo Stream - Metadata Generator');
    console.log('==========================================\n');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const force = args.includes("--force");
    const updateExif = args.includes("--update-exif");
    const updateLocations = args.includes("--update-locations");
    const specificFile = args.find((arg) => !arg.startsWith("--"));

    // Show configuration
    console.log('Configuration:');
    console.log(`📁 Photos: ${ASSETS_DIR}`);
    console.log(`📄 Content: ${CONTENT_DIR}`);
    console.log(`🤖 Claude API: ${anthropic ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🗺️  OpenCage API: ${OPENCAGE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log('');

    try {
        // Handle update modes
        if (updateExif) {
            console.log('🔄 EXIF Update Mode');
            const imageFiles = specificFile 
                ? [specificFile]
                : await findImageFiles(ASSETS_DIR);
            
            for (const imagePath of imageFiles) {
                await updateExifFields(imagePath);
            }
            return;
        }
        
        if (updateLocations) {
            console.log('🗺️ Location Update Mode');
            const imageFiles = specificFile 
                ? [specificFile]
                : await findImageFiles(ASSETS_DIR);
            
            for (const imagePath of imageFiles) {
                await updateLocationStrings(imagePath);
            }
            return;
        }
        
        // Normal processing mode
        if (specificFile) {
            console.log(`Processing specific file: ${specificFile}\n`);
            await processImage(specificFile, force);
        } else {
            // Find all images
            const imageFiles = await findImageFiles(ASSETS_DIR);
            console.log(`Found ${imageFiles.length} image file(s)`);
            
            if (imageFiles.length === 0) {
                console.log('No images found to process.');
                return;
            }
            
            // Sort by EXIF date (oldest first, matching reference)
            console.log('📅 Sorting images by date...');
            const sortedImages = [];
            for (const imagePath of imageFiles) {
                try {
                    const exifData = await extractExifData(imagePath);
                    const date = exifData.dateTime || (await fs.stat(imagePath)).mtime;
                    sortedImages.push({ path: imagePath, date });
                } catch (error) {
                    sortedImages.push({ path: imagePath, date: new Date() });
                }
            }
            
            sortedImages.sort((a, b) => a.date.getTime() - b.date.getTime());
            const sortedPaths = sortedImages.map(item => item.path);
            
            // Ask for confirmation if not forced
            if (!force) {
                const answer = await question(`\n📸 Process ${sortedPaths.length} images? (y/N): `);
                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    console.log('Operation cancelled.');
                    return;
                }
            }
            
            console.log('');
            
            // Process each image
            let processed = 0;
            let skipped = 0;
            let failed = 0;
            
            for (let i = 0; i < sortedPaths.length; i++) {
                const imagePath = sortedPaths[i];
                console.log(`[${i + 1}/${sortedPaths.length}]`);
                
                try {
                    if (!force && await hasMetadataFile(imagePath)) {
                        console.log(`⏭️  Skipping ${path.basename(imagePath)} (metadata exists)`);
                        skipped++;
                    } else {
                        await processImage(imagePath, force);
                        processed++;
                    }
                } catch (error) {
                    console.error(`❌ Failed ${path.basename(imagePath)}:`, error);
                    failed++;
                }
                
                console.log('');
            }
            
            // Summary
            console.log('📊 Processing Summary:');
            console.log(`✅ Processed: ${processed}`);
            console.log(`⏭️  Skipped: ${skipped}`);
            console.log(`❌ Failed: ${failed}`);
            console.log(`📁 Content files: ${CONTENT_DIR}`);
            
            if (processed > 0) {
                console.log('\n🎉 Photo metadata generation complete!');
                console.log('Your photo gallery is ready to build.');
            }
        }
    } catch (error) {
        console.error('❌ Generation failed:', error);
        process.exit(1);
    }
}

// ============================================================================
// ERROR HANDLING AND PROCESS MANAGEMENT
// ============================================================================

// Handle interruption gracefully
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Operation interrupted by user');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    process.exit(1);
});

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { generateMetadata, extractExifData, analyzeLLMContent, reverseGeocode };