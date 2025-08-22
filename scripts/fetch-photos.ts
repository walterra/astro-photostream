#!/usr/bin/env tsx

import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const OUTPUT_DIR = join(__dirname, '..', 'src', 'assets', 'photos');
const TARGET_COUNT = 50;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

interface WikimediaImage {
  pageid: number;
  title: string;
  imageinfo: Array<{
    url: string;
    extmetadata?: {
      DateTimeOriginal?: { value: string };
      ImageDescription?: { value: string };
      Artist?: { value: string };
    };
  }>;
  coordinates?: Array<{
    lat: number;
    lon: number;
  }>;
}

interface WikimediaResponse {
  query: {
    pages: Record<string, WikimediaImage>;
  };
  continue?: {
    gcmcontinue: string;
  };
}

/**
 * Fetch photos from Wikimedia Commons with GPS coordinates
 */
async function fetchWikimediaPhotos(
  category: string,
  limit: number = 25,
  continueToken?: string
): Promise<{ photos: WikimediaImage[]; nextContinue?: string }> {
  const baseUrl = 'https://commons.wikimedia.org/w/api.php';
  const params = new URLSearchParams({
    action: 'query',
    generator: 'categorymembers',
    gcmtype: 'file',
    gcmsort: 'timestamp',
    gcmdir: 'asc', // Deterministic oldest-first sorting
    gcmlimit: limit.toString(),
    prop: 'imageinfo|coordinates',
    iiprop: 'url|extmetadata',
    iiurlwidth: '2048', // Request reasonably sized images
    format: 'json',
    gcmtitle: category,
    ...(continueToken && { gcmcontinue: continueToken })
  });

  const response = await fetch(`${baseUrl}?${params}`);
  if (!response.ok) {
    throw new Error(`Wikimedia API request failed: ${response.status} ${response.statusText}`);
  }

  const data: WikimediaResponse = await response.json();
  
  // Filter for images with GPS coordinates
  const photosWithGPS = Object.values(data.query?.pages || {}).filter(
    (page): page is WikimediaImage => 
      page.imageinfo?.length > 0 && 
      page.coordinates?.length > 0 &&
      page.imageinfo[0].url !== undefined
  );

  return {
    photos: photosWithGPS,
    nextContinue: data.continue?.gcmcontinue
  };
}

/**
 * Download image with retry logic
 */
async function downloadImage(url: string, filename: string, retries = MAX_RETRIES): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Downloading ${filename}... (attempt ${attempt})`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const filepath = join(OUTPUT_DIR, filename);
      
      await writeFile(filepath, Buffer.from(buffer));
      console.log(`✓ Downloaded: ${filename}`);
      return;
      
    } catch (error) {
      console.error(`✗ Attempt ${attempt} failed for ${filename}: ${error}`);
      
      if (attempt === retries) {
        throw new Error(`Failed to download ${filename} after ${retries} attempts`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
}

/**
 * Generate safe filename from Wikimedia title
 */
function generateFilename(title: string, index: number): string {
  // Remove "File:" prefix and clean up the title
  const cleanTitle = title
    .replace(/^File:/, '')
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9\-_]/g, '-') // Replace special chars with dashes
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-+|-+$/g, '') // Trim dashes from start/end
    .toLowerCase();
  
  // Pad index for consistent sorting
  const paddedIndex = index.toString().padStart(3, '0');
  
  return `${paddedIndex}-${cleanTitle}.jpg`;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Fetching Creative Commons photos from Wikimedia Commons...');
    console.log(`Target: ${TARGET_COUNT} photos with GPS coordinates\n`);

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    const allPhotos: WikimediaImage[] = [];
    
    // Fetch Featured Pictures first (highest quality)
    console.log('📸 Fetching Featured Pictures...');
    const featuredResult = await fetchWikimediaPhotos(
      'Category:Featured_pictures_on_Wikimedia_Commons',
      Math.ceil(TARGET_COUNT * 0.6) // ~60% from Featured Pictures
    );
    allPhotos.push(...featuredResult.photos);
    console.log(`Found ${featuredResult.photos.length} Featured Pictures with GPS\n`);

    // Fill remaining slots with Quality Images if needed
    if (allPhotos.length < TARGET_COUNT) {
      const remaining = TARGET_COUNT - allPhotos.length;
      console.log(`📷 Fetching ${remaining} additional Quality Images...`);
      
      const qualityResult = await fetchWikimediaPhotos(
        'Category:Quality_images',
        remaining
      );
      allPhotos.push(...qualityResult.photos);
      console.log(`Found ${qualityResult.photos.length} Quality Images with GPS\n`);
    }

    // Trim to target count
    const selectedPhotos = allPhotos.slice(0, TARGET_COUNT);
    console.log(`🎯 Selected ${selectedPhotos.length} photos for download\n`);

    // Download photos
    console.log('⬇️  Starting downloads...\n');
    const downloadPromises = selectedPhotos.map(async (photo, index) => {
      const imageUrl = photo.imageinfo[0].url;
      const filename = generateFilename(photo.title, index + 1);
      
      try {
        await downloadImage(imageUrl, filename);
      } catch (error) {
        console.error(`Failed to download photo ${index + 1}: ${error}`);
      }
    });

    await Promise.all(downloadPromises);

    console.log('\n✅ Photo fetch completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Target photos: ${TARGET_COUNT}`);
    console.log(`   • Found with GPS: ${selectedPhotos.length}`);
    console.log(`   • Output directory: ${OUTPUT_DIR}`);
    console.log('\n💡 Next steps:');
    console.log('   • Run the metadata generator to create .md files');
    console.log('   • Update demo content to use local photos');

  } catch (error) {
    console.error('\n❌ Error occurred:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}