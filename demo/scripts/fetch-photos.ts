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
const FETCH_MULTIPLIER = 10; // Fetch 10x more to account for GPS filtering
const MIN_GPS_PHOTOS = Math.ceil(TARGET_COUNT * 0.6); // Minimum GPS photos before fallback

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
 * Fetch photos from Wikimedia Commons with GPS coordinates (strict filtering)
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
    gcmdir: 'desc', // Get newest first for better variety
    gcmlimit: Math.min(limit, 500).toString(), // API limit is 500
    prop: 'imageinfo|coordinates',
    iiprop: 'url|extmetadata',
    iiurlwidth: '2048', // Request reasonably sized images
    format: 'json',
    gcmtitle: category,
    ...(continueToken && { gcmcontinue: continueToken }),
  });

  const response = await fetch(`${baseUrl}?${params}`);
  if (!response.ok) {
    throw new Error(
      `Wikimedia API request failed: ${response.status} ${response.statusText}`
    );
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
    nextContinue: data.continue?.gcmcontinue,
  };
}

/**
 * Fetch all photos from a category (including those without GPS) for fallback
 */
async function fetchAllPhotos(
  category: string,
  limit: number = 25,
  continueToken?: string
): Promise<WikimediaImage[]> {
  const baseUrl = 'https://commons.wikimedia.org/w/api.php';
  const params = new URLSearchParams({
    action: 'query',
    generator: 'categorymembers',
    gcmtype: 'file',
    gcmsort: 'timestamp',
    gcmdir: 'desc',
    gcmlimit: Math.min(limit, 500).toString(),
    prop: 'imageinfo|coordinates',
    iiprop: 'url|extmetadata',
    iiurlwidth: '2048',
    format: 'json',
    gcmtitle: category,
    ...(continueToken && { gcmcontinue: continueToken }),
  });

  const response = await fetch(`${baseUrl}?${params}`);
  if (!response.ok) {
    throw new Error(
      `Wikimedia API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data: WikimediaResponse = await response.json();

  // Return all photos with valid image URLs (no GPS filtering)
  return Object.values(data.query?.pages || {}).filter(
    (page): page is WikimediaImage =>
      page.imageinfo?.length > 0 && page.imageinfo[0].url !== undefined
  );
}

/**
 * Download image with retry logic
 */
async function downloadImage(
  url: string,
  filename: string,
  retries = MAX_RETRIES
): Promise<void> {
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
        throw new Error(
          `Failed to download ${filename} after ${retries} attempts`
        );
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
 * Geo-targeted categories more likely to have GPS coordinates
 */
const GEO_CATEGORIES = [
  'Category:Featured_pictures_on_Wikimedia_Commons', // Keep for quality
  'Category:Quality_images', // Keep for quality
  'Category:Photographs_by_country', // Geographic grouping
  'Category:Landscape_photographs', // Often have location data
  'Category:Nature_photographs', // Wildlife photography often geotagged
  'Category:Architecture_photographs', // Buildings have locations
  'Category:Travel_photographs', // Travel photos often geotagged
];

/**
 * Main execution function
 */
async function main() {
  try {
    console.log(
      '🚀 Fetching Creative Commons photos from Wikimedia Commons...'
    );
    console.log(
      `Target: ${TARGET_COUNT} photos (prioritizing GPS coordinates)\n`
    );

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    const allPhotos: WikimediaImage[] = [];
    const allPhotosNoGPS: WikimediaImage[] = [];

    // Try multiple categories to find GPS-enabled photos
    for (
      let i = 0;
      i < GEO_CATEGORIES.length && allPhotos.length < TARGET_COUNT;
      i++
    ) {
      const category = GEO_CATEGORIES[i];
      console.log(`📸 Fetching from ${category.replace('Category:', '')}...`);

      const result = await fetchWikimediaPhotos(
        category,
        TARGET_COUNT * FETCH_MULTIPLIER // Fetch many more to account for filtering
      );

      // Separate GPS vs non-GPS photos
      const gpsPhotos = result.photos;
      console.log(`Found ${gpsPhotos.length} photos with GPS coordinates`);

      allPhotos.push(...gpsPhotos);

      // Also collect non-GPS photos as fallback (fetch without GPS filter)
      if (allPhotos.length < MIN_GPS_PHOTOS) {
        const allResultPhotos = await fetchAllPhotos(category, TARGET_COUNT);
        allPhotosNoGPS.push(
          ...allResultPhotos.filter(
            photo =>
              !photo.coordinates?.length &&
              photo.imageinfo?.length > 0 &&
              photo.imageinfo[0].url !== undefined
          )
        );
        console.log(
          `Also collected ${allPhotosNoGPS.length} fallback photos without GPS`
        );
      }

      console.log(`Total GPS photos so far: ${allPhotos.length}\n`);
    }

    // Fallback strategy: if we don't have enough GPS photos, use quality photos without GPS
    if (allPhotos.length < MIN_GPS_PHOTOS) {
      const needed = TARGET_COUNT - allPhotos.length;
      console.log(
        `⚠️  Only found ${allPhotos.length} GPS photos, adding ${needed} quality photos without GPS...`
      );
      allPhotos.push(...allPhotosNoGPS.slice(0, needed));
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
