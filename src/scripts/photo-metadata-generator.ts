#!/usr/bin/env tsx
/**
 * Photo Metadata Generator CLI
 * Aligned with reference implementation from /Users/walterra/dev/walterra-dev
 * 
 * Generates comprehensive photo metadata using modular classes:
 * - ExifProcessor for EXIF data extraction
 * - ClaudeAnalyzer for AI-powered content generation  
 * - GeocodeProcessor for location name resolution
 * - PhotoMetadataGenerator orchestrating all processors
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { 
  PhotoMetadataGenerator,
  ExifProcessor,
  ClaudeAnalyzer,
  GeocodeProcessor,
  extractExifData
} from '../utils/metadata.js';
import { loadConfig } from '../utils/config.js';
import type { IntegrationOptions, PhotoMetadata } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES FOR CLI
// ============================================================================

interface ExistingMetadata {
    frontmatter: Record<string, unknown>;
    content: string;
}

// ============================================================================
// CONFIGURATION (aligned with reference)
// ============================================================================

// Directories
const CONTENT_DIR = process.env.CONTENT_DIRECTORY || './src/content/photos';
const ASSETS_DIR = process.env.PHOTOS_DIRECTORY || './src/assets/photos';

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.tiff', '.tif'];

// Configuration will be loaded in main() function
let integrationOptions: IntegrationOptions;
let metadataGenerator: PhotoMetadataGenerator;

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

/**
 * Generate markdown content with frontmatter
 */
function generateMarkdownContent(metadata: PhotoMetadata, imagePath: string): string {
    const filename = path.basename(imagePath);
    
    // Build frontmatter object
    const frontmatter: any = {
        title: metadata.title,
        publishDate: metadata.publishDate.toISOString().split('T')[0],
        coverImage: {
            alt: metadata.coverImage.alt,
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
    const dateStr = metadata.publishDate.toISOString().split('T')[0];
    return `${dateStr}_${originalFilename}.md`;
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
async function hasMetadataFile(imagePath: string, contentDir: string): Promise<boolean> {
    try {
        // We need to extract EXIF to get the correct filename
        const exifData = await extractExifData(imagePath);
        const publishDate = exifData.dateTime || new Date();
        const dateStr = publishDate.toISOString().split('T')[0];
        const originalFilename = path.parse(imagePath).name;
        const metadataFilename = `${dateStr}_${originalFilename}.md`;
        const metadataPath = path.join(contentDir, metadataFilename);
        
        await fs.access(metadataPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Process a single image file using the modular metadata generator
 */
async function processImage(imagePath: string, contentDir: string, force = false): Promise<void> {
    // Check if metadata already exists
    if (!force && await hasMetadataFile(imagePath, contentDir)) {
        console.log(`⏭️  Skipping ${path.basename(imagePath)} (metadata exists)`);
        return;
    }
    
    try {
        // Generate metadata using our modular generator
        const metadata = await metadataGenerator.generateMetadata(imagePath);
        
        // Generate content
        const markdownContent = generateMarkdownContent(metadata, imagePath);
        const filename = generateFilename(metadata, imagePath);
        const outputPath = path.join(contentDir, filename);
        
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
 * Update only EXIF fields in existing metadata files using the modular processor
 */
async function updateExifFields(imagePath: string, contentDir: string): Promise<void> {
    const filename = path.basename(imagePath);
    console.log(`🔄 Updating EXIF for: ${filename}`);
    
    try {
        // Extract EXIF data using our modular processor
        const exifProcessor = new ExifProcessor();
        const exifData = await exifProcessor.extractExifData(imagePath);
        const publishDate = exifData.dateTime || new Date();
        const dateStr = publishDate.toISOString().split('T')[0];
        const originalFilename = path.parse(imagePath).name;
        const metadataFilename = `${dateStr}_${originalFilename}.md`;
        const metadataPath = path.join(contentDir, metadataFilename);
        
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
 * Update only location strings in existing metadata files using the modular processors
 */
async function updateLocationStrings(imagePath: string, contentDir: string): Promise<void> {
    const filename = path.basename(imagePath);
    console.log(`🗺️  Updating location for: ${filename}`);
    
    try {
        // Extract GPS coordinates using our modular processor
        const exifProcessor = new ExifProcessor();
        const exifData = await exifProcessor.extractExifData(imagePath);
        if (!exifData.location) {
            console.log(`⏭️  No GPS data for ${filename}`);
            return;
        }
        
        // Get location name using our modular geocoder
        const geocodeProcessor = new GeocodeProcessor(process.env.OPENCAGE_API_KEY);
        const locationName = await geocodeProcessor.reverseGeocode(
            exifData.location.latitude!, 
            exifData.location.longitude!
        );
        if (!locationName) {
            console.log(`⏭️  No location name found for ${filename}`);
            return;
        }
        
        // Find existing metadata file
        const publishDate = exifData.dateTime || new Date();
        const dateStr = publishDate.toISOString().split('T')[0];
        const originalFilename = path.parse(imagePath).name;
        const metadataFilename = `${dateStr}_${originalFilename}.md`;
        const metadataPath = path.join(contentDir, metadataFilename);
        
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
    const generateConfig = args.includes("--generate-config");
    const specificFile = args.find((arg) => !arg.startsWith("--"));

    // Handle config generation command
    if (generateConfig) {
        const { configManager } = await import('../utils/config.js');
        await configManager.writeExampleConfig();
        console.log('');
        console.log('Next steps:');
        console.log('1. Edit the generated astro-photo-stream.config.js file');
        console.log('2. Add your API keys to environment variables or the config file');
        console.log('3. Run the metadata generator again');
        return;
    }

    // Load configuration from file, environment, and defaults
    console.log('📋 Loading configuration...');
    integrationOptions = await loadConfig();
    metadataGenerator = new PhotoMetadataGenerator(integrationOptions);

    // Override directories from legacy environment variables if set
    const contentDir = process.env.CONTENT_DIRECTORY || integrationOptions.photos.directory;
    const assetsDir = process.env.PHOTOS_DIRECTORY || integrationOptions.photos.assetsDirectory || 'src/assets/photos';

    // Show configuration
    console.log('Configuration:');
    console.log(`📁 Photos: ${assetsDir}`);
    console.log(`📄 Content: ${contentDir}`);
    console.log(`🤖 Claude API: ${integrationOptions.ai.enabled ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🗺️  OpenCage API: ${integrationOptions.geolocation.enabled ? '✅ Configured' : '❌ Missing'}`);
    console.log('');

    try {
        // Handle update modes
        if (updateExif) {
            console.log('🔄 EXIF Update Mode');
            const imageFiles = specificFile 
                ? [specificFile]
                : await findImageFiles(assetsDir);
            
            for (const imagePath of imageFiles) {
                await updateExifFields(imagePath, contentDir);
            }
            return;
        }
        
        if (updateLocations) {
            console.log('🗺️ Location Update Mode');
            const imageFiles = specificFile 
                ? [specificFile]
                : await findImageFiles(assetsDir);
            
            for (const imagePath of imageFiles) {
                await updateLocationStrings(imagePath, contentDir);
            }
            return;
        }
        
        // Normal processing mode
        if (specificFile) {
            console.log(`Processing specific file: ${specificFile}\n`);
            await processImage(specificFile, contentDir, force);
        } else {
            // Find all images
            const imageFiles = await findImageFiles(assetsDir);
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
                    if (!force && await hasMetadataFile(imagePath, contentDir)) {
                        console.log(`⏭️  Skipping ${path.basename(imagePath)} (metadata exists)`);
                        skipped++;
                    } else {
                        await processImage(imagePath, contentDir, force);
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
            console.log(`📁 Content files: ${contentDir}`);
            
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