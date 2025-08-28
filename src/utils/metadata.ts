import fs from 'fs/promises';
import path from 'path';
import exifr from 'exifr';
import sharp from 'sharp';
import type { PhotoMetadata, IntegrationOptions } from '../types.js';

// ============================================================================
// TYPES
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

// ============================================================================
// CORE PROCESSOR CLASSES
// ============================================================================

/**
 * EXIF Data Processor - Extracts technical metadata from images
 * Based on reference implementation patterns
 */
export class ExifProcessor {
  constructor() {}

  async extractExifData(imagePath: string): Promise<ExifData> {
    try {
      const exifData = await exifr.parse(imagePath, {
        pick: [
          'Make',
          'Model',
          'LensModel',
          'FNumber',
          'ExposureTime',
          'ISO',
          'FocalLengthIn35mmFormat',
          'FocalLength',
          'GPS',
          'DateTimeOriginal',
          'DateTime',
          'ImageDescription',
          'UserComment',
          'XPComment',
          'XPSubject',
        ],
      });

      if (!exifData) {
        return {};
      }

      // Format camera information
      const camera =
        exifData.Make && exifData.Model
          ? `${exifData.Make} ${exifData.Model}`
          : undefined;

      // Format settings
      const settings: Record<string, string> = {};
      if (exifData.FNumber) {
        settings.aperture = `f/${exifData.FNumber}`;
      }
      if (exifData.ExposureTime) {
        settings.shutter =
          exifData.ExposureTime >= 1
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
              longitude: coords.longitude,
            };
          }
        } catch (error) {
          console.warn('Failed to extract GPS coordinates:', error);
        }
      }

      // Extract description from various EXIF fields
      const description =
        exifData.ImageDescription ||
        exifData.UserComment ||
        exifData.XPComment ||
        exifData.XPSubject;

      return {
        camera,
        lens: exifData.LensModel,
        settings: Object.keys(settings).length > 0 ? settings : undefined,
        location,
        dateTime: exifData.DateTimeOriginal || exifData.DateTime,
        caption: description,
      };
    } catch (error) {
      console.warn(`Failed to extract EXIF from ${imagePath}:`, error);
      return {};
    }
  }
}

/**
 * LLM Analyzer - AI-powered content analysis
 * Base class for different AI providers
 */
export abstract class LLMAnalyzer {
  protected recentOutputs: LLMAnalysis[] = [];

  constructor(protected options: IntegrationOptions['ai']) {}

  abstract analyzeContent(
    imagePath: string,
    exifData?: ExifData
  ): Promise<LLMAnalysis>;

  protected async compressImageForAPI(imagePath: string): Promise<Buffer> {
    // Target ~3.7MB buffer size to account for Base64 encoding overhead (~33%)
    const MAX_BUFFER_SIZE = Math.floor(5 * 1024 * 1024 * 0.75); // ~3.75MB

    const originalBuffer = await fs.readFile(imagePath);
    let compressedBuffer: Buffer;
    let quality = 85;
    let maxWidth = 1920;

    // Start with reasonable size and quality
    compressedBuffer = await sharp(originalBuffer)
      .resize(maxWidth, maxWidth, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    // If still too large, reduce both size and quality progressively
    while (
      compressedBuffer.length > MAX_BUFFER_SIZE &&
      (quality > 20 || maxWidth > 800)
    ) {
      if (quality > 40) {
        quality -= 15; // Reduce quality more aggressively first
      } else if (maxWidth > 800) {
        maxWidth = Math.floor(maxWidth * 0.8); // Then reduce size
        quality = Math.max(quality, 30); // Reset quality when resizing
      } else {
        quality -= 5; // Final quality reduction
      }

      compressedBuffer = await sharp(originalBuffer)
        .resize(maxWidth, maxWidth, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
    }

    if (compressedBuffer.length > MAX_BUFFER_SIZE) {
      throw new Error(
        `Unable to compress image below ${MAX_BUFFER_SIZE} bytes`
      );
    }

    return compressedBuffer;
  }

  protected getFallbackAnalysis(
    imagePath: string,
    exifData?: ExifData
  ): LLMAnalysis {
    const filename = path.basename(imagePath);

    return {
      title: filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
      description: `A photograph${exifData?.dateTime ? ` captured on ${exifData.dateTime.toLocaleDateString()}` : ''}.`,
      altText: `Photograph: ${filename}`,
      suggestedTags: [
        'photography',
        ...(exifData?.dateTime
          ? [exifData.dateTime.getFullYear().toString()]
          : []),
      ],
    };
  }

  protected storeInMemory(analysis: LLMAnalysis, exifData?: ExifData): void {
    const analysisWithDate = {
      ...analysis,
      processedDate: exifData?.dateTime || new Date(),
    };
    this.recentOutputs.push(analysisWithDate);
    if (this.recentOutputs.length > 5) {
      this.recentOutputs.shift(); // Remove oldest entry
    }
  }
}

/**
 * Claude API Analyzer
 */
export class ClaudeAnalyzer extends LLMAnalyzer {
  private client: any;

  constructor(options: IntegrationOptions['ai']) {
    super(options);

    if (options.apiKey) {
      // Dynamic import to handle optional dependency
      import('@anthropic-ai/sdk')
        .then(({ default: Anthropic }) => {
          this.client = new Anthropic({ apiKey: options.apiKey });
        })
        .catch(error => {
          console.warn('Anthropic SDK not available:', error);
        });
    }
  }

  async analyzeContent(
    imagePath: string,
    exifData?: ExifData
  ): Promise<LLMAnalysis> {
    const filename = path.basename(imagePath);
    const fallback = this.getFallbackAnalysis(imagePath, exifData);

    if (!this.client || !this.options.apiKey) {
      console.warn('Claude API not configured, using filename-based analysis');
      return fallback;
    }

    try {
      // Compress image for API
      const compressedBuffer = await this.compressImageForAPI(imagePath);
      const base64Image = compressedBuffer.toString('base64');

      // Build context from recent outputs (memory system)
      const recentContext =
        this.recentOutputs.length > 0
          ? `Recent outputs to avoid repetition: ${this.recentOutputs
              .slice(-3)
              .map(r => r.title)
              .join(', ')}`
          : '';

      // Camera context
      const cameraInfo = exifData?.camera || 'Unknown camera';
      const isSmartphone =
        cameraInfo.toLowerCase().includes('iphone') ||
        cameraInfo.toLowerCase().includes('pixel') ||
        cameraInfo.toLowerCase().includes('samsung');

      // Technical context
      const techContext = exifData?.settings
        ? [
            exifData.settings.aperture,
            exifData.settings.shutter,
            exifData.settings.iso && `ISO ${exifData.settings.iso}`,
            exifData.settings.focalLength,
          ]
            .filter(Boolean)
            .join(', ')
        : '';

      // Build comprehensive prompt
      const prompt =
        this.options.prompt ||
        `You are analyzing a photograph for a photography blog. 

${recentContext ? `CONTEXT: ${recentContext}\n` : ''}
Filename: ${filename}
Camera: ${cameraInfo}${isSmartphone ? ' (Smartphone camera)' : ' (Dedicated camera)'}
${exifData?.lens ? `Lens: ${exifData.lens}` : ''}
${techContext ? `Settings: ${techContext}` : ''}
${exifData?.location ? `Location: ${exifData.location.latitude?.toFixed(4)}, ${exifData.location.longitude?.toFixed(4)}` : ''}
${exifData?.dateTime ? `Date: ${exifData.dateTime.toLocaleDateString()}` : ''}

Generate JSON with these fields:
- title: 30-60 chars, engaging and descriptive, SEO-friendly
- description: 200-250 chars, engaging description
- altText: Concise accessibility description
- suggestedTags: Array of relevant tags (include year if determinable)

Focus on what makes this photo interesting or worth sharing. Avoid generic descriptions.`;

      const message = await this.client.messages.create({
        model: this.options.model || 'claude-3-haiku-20240307',
        max_tokens: 400,
        temperature: 0.9,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

      // Extract and parse JSON response
      const responseText =
        message.content[0]?.type === 'text' ? message.content[0].text : '';
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/) ||
        responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);

        const analysis: LLMAnalysis = {
          title: parsed.title || fallback.title,
          description: parsed.description || fallback.description,
          altText: parsed.altText || fallback.altText,
          suggestedTags: Array.isArray(parsed.suggestedTags)
            ? parsed.suggestedTags
            : fallback.suggestedTags,
        };

        this.storeInMemory(analysis, exifData);
        return analysis;
      }

      console.warn('Failed to parse AI response, using fallback');
      return fallback;
    } catch (error) {
      console.warn(`AI analysis failed for ${filename}:`, error);
      return fallback;
    }
  }
}

/**
 * Geocode Processor - Location name resolution
 */
export class GeocodeProcessor {
  constructor(private apiKey?: string) {}

  async reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
    if (!this.apiKey) {
      console.warn('OpenCage API key not configured');
      return undefined;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${this.apiKey}&no_annotations=0&no_dedupe=1&language=en&limit=5`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return undefined;
      }

      // Scoring system for result specificity
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
      function getEnglishName(component: unknown): string | undefined {
        if (typeof component === 'string') {
          return component;
        }
        if (typeof component === 'object' && component !== null) {
          const componentObj = component as Record<string, any>;
          return (
            componentObj.en ||
            componentObj.eng ||
            Object.values(componentObj)[0]
          );
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
}

/**
 * Photo Metadata Generator - Orchestrates all processors
 */
export class PhotoMetadataGenerator {
  private exifProcessor: ExifProcessor;
  private llmAnalyzer?: LLMAnalyzer;
  private geocodeProcessor?: GeocodeProcessor;

  constructor(private options: IntegrationOptions) {
    this.exifProcessor = new ExifProcessor();

    if (options.ai.enabled && options.ai.apiKey) {
      switch (options.ai.provider) {
        case 'claude':
          this.llmAnalyzer = new ClaudeAnalyzer(options.ai);
          break;
        // TODO: Add OpenAI and other providers
        default:
          console.warn(`Unsupported AI provider: ${options.ai.provider}`);
      }
    }

    if (options.geolocation.enabled) {
      // Get API key from environment variable for now
      // TODO: Add proper configuration system
      const geocodeApiKey = process.env.OPENCAGE_API_KEY;
      if (geocodeApiKey) {
        this.geocodeProcessor = new GeocodeProcessor(geocodeApiKey);
      }
    }
  }

  async generateMetadata(imagePath: string): Promise<PhotoMetadata> {
    console.log(`🔍 Processing: ${path.basename(imagePath)}`);

    // Extract EXIF data
    const exifData = await this.exifProcessor.extractExifData(imagePath);

    // Process location if GPS data available
    if (exifData.location && this.geocodeProcessor) {
      const locationName = await this.geocodeProcessor.reverseGeocode(
        exifData.location.latitude!,
        exifData.location.longitude!
      );
      if (locationName) {
        exifData.location.name = locationName;
      }
    }

    // Generate AI analysis
    let llmAnalysis: LLMAnalysis;
    if (this.llmAnalyzer) {
      llmAnalysis = await this.llmAnalyzer.analyzeContent(imagePath, exifData);
    } else {
      // Fallback analysis
      const filename = path.basename(imagePath);
      llmAnalysis = {
        title: filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        description: `A photograph${exifData?.dateTime ? ` captured on ${exifData.dateTime.toLocaleDateString()}` : ''}.`,
        altText: `Photograph: ${filename}`,
        suggestedTags: [
          'photography',
          ...(exifData?.dateTime
            ? [exifData.dateTime.getFullYear().toString()]
            : []),
        ],
      };
    }

    // Determine publish date
    const publishDate = exifData.dateTime || new Date();

    // Generate unique ID
    const fileName = path.basename(imagePath);
    const id = fileName.replace(/\.[^/.]+$/, ''); // Remove extension

    // Combine all metadata
    return {
      id,
      title: llmAnalysis.title,
      description: llmAnalysis.description,
      coverImage: {
        alt: llmAnalysis.altText,
        src: imagePath, // This will be processed by Astro's image handling
      },
      camera: exifData.camera,
      lens: exifData.lens,
      settings: exifData.settings,
      location: exifData.location,
      tags: llmAnalysis.suggestedTags,
      publishDate,
      draft: false,
    };
  }
}

// ============================================================================
// PUBLIC API - Updated implementations
// ============================================================================

/**
 * Generate photo metadata from EXIF data and file information
 */
export async function generatePhotoMetadata(
  filePath: string,
  options: IntegrationOptions
): Promise<PhotoMetadata> {
  const generator = new PhotoMetadataGenerator(options);
  return generator.generateMetadata(filePath);
}

/**
 * Extract EXIF data from photo file
 */
export async function extractExifData(filePath: string): Promise<ExifData> {
  const processor = new ExifProcessor();
  return processor.extractExifData(filePath);
}

/**
 * Generate AI-powered metadata using configured provider
 */
export async function generateAIMetadata(
  filePath: string,
  exifData: ExifData,
  options: IntegrationOptions
): Promise<{ title?: string; description?: string; tags: string[] }> {
  if (!options.ai.enabled || !options.ai.apiKey) {
    return {
      title: undefined,
      description: undefined,
      tags: [],
    };
  }

  let analyzer: LLMAnalyzer;
  switch (options.ai.provider) {
    case 'claude':
      analyzer = new ClaudeAnalyzer(options.ai);
      break;
    default:
      console.warn(`Unsupported AI provider: ${options.ai.provider}`);
      return { title: undefined, description: undefined, tags: [] };
  }

  const analysis = await analyzer.analyzeContent(filePath, exifData);
  return {
    title: analysis.title,
    description: analysis.description,
    tags: analysis.suggestedTags,
  };
}
