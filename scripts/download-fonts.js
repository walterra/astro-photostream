#!/usr/bin/env node

/**
 * Download fonts script
 * Downloads required fonts for OG image generation during package installation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_URLS = {
  'roboto-mono-regular.ttf': 'https://github.com/googlefonts/RobotoMono/raw/refs/heads/main/fonts/ttf/RobotoMono-Regular.ttf',
  'roboto-mono-700.ttf': 'https://github.com/googlefonts/RobotoMono/raw/refs/heads/main/fonts/ttf/RobotoMono-Bold.ttf'
};

async function downloadFont(url, filename) {
  console.log(`Downloading ${filename}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download ${filename}: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error.message);
    throw error;
  }
}

async function main() {
  // Create fonts directory
  const fontsDir = path.resolve(__dirname, '../src/assets/fonts');
  
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
    console.log(`Created fonts directory: ${fontsDir}`);
  }
  
  // Download fonts
  for (const [filename, url] of Object.entries(FONT_URLS)) {
    const fontPath = path.join(fontsDir, filename);
    
    // Skip if font already exists
    if (fs.existsSync(fontPath)) {
      console.log(`Font ${filename} already exists, skipping download`);
      continue;
    }
    
    try {
      const fontData = await downloadFont(url, filename);
      fs.writeFileSync(fontPath, fontData);
      console.log(`✅ Downloaded ${filename} (${fontData.length} bytes)`);
    } catch (error) {
      console.error(`❌ Failed to download ${filename}`);
      process.exit(1);
    }
  }
  
  console.log('🎉 All fonts downloaded successfully!');
}

main().catch(error => {
  console.error('Font download failed:', error);
  process.exit(1);
});