import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { integrationOptionsSchema, type IntegrationOptions } from "../types.js";

/**
 * Configuration Manager for Astro Photo Stream
 * Handles loading configuration from files, environment variables, and defaults
 */

// Configuration file schema (for astro-photostream.config.js)
const configFileSchema = z.object({
  // Core configuration
  enabled: z.boolean().default(true),

  // Photo processing options
  photos: z
    .object({
      directory: z.string().default("src/content/photos"), // Directory for photo markdown (.md) files
      assetsDirectory: z.string().default("src/assets/photos"),
      formats: z
        .array(z.enum(["jpg", "jpeg", "png", "webp", "avif"]))
        .default(["jpg", "jpeg", "png", "webp"]),
      maxWidth: z.number().default(1920),
      maxHeight: z.number().default(1080),
      quality: z.number().min(1).max(100).default(85),
    })
    .default({}),

  // AI metadata generation
  ai: z
    .object({
      enabled: z.boolean().default(false),
      provider: z.enum(["claude", "openai", "custom"]).default("claude"),
      apiKey: z.string().optional(),
      model: z.string().optional(),
      prompt: z.string().optional(),
      maxTokens: z.number().default(400),
      temperature: z.number().min(0).max(2).default(0.9),
    })
    .default({}),

  // Geolocation processing
  geolocation: z
    .object({
      enabled: z.boolean().default(true),
      apiKey: z.string().optional(), // OpenCage API key
      privacy: z
        .object({
          enabled: z.boolean().default(true),
          radius: z.number().default(1000), // meters
          method: z.enum(["blur", "offset", "disable"]).default("blur"),
        })
        .default({}),
    })
    .default({}),

  // Gallery display options
  gallery: z
    .object({
      itemsPerPage: z.number().default(20),
      gridCols: z
        .object({
          mobile: z.number().default(2),
          tablet: z.number().default(3),
          desktop: z.number().default(4),
        })
        .default({}),
      enableMap: z.boolean().default(true),
      enableTags: z.boolean().default(true),
      enableSearch: z.boolean().default(false),
    })
    .default({}),

  // SEO and social
  seo: z
    .object({
      generateOpenGraph: z.boolean().default(true),
      siteName: z.string().optional(),
      twitterHandle: z.string().optional(),
    })
    .default({}),
});

export type ConfigFile = z.infer<typeof configFileSchema>;

/**
 * Configuration Manager Class
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: IntegrationOptions | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load configuration from multiple sources in priority order:
   * 1. Provided options (highest priority)
   * 2. astro-photostream.config.js file
   * 3. Environment variables
   * 4. Defaults (lowest priority)
   */
  async loadConfig(
    providedOptions?: Partial<IntegrationOptions>,
    cwd?: string,
  ): Promise<IntegrationOptions> {
    if (this.config && !providedOptions) {
      return this.config;
    }

    const workingDir = cwd || process.cwd();

    // Start with defaults
    let config: any = {
      enabled: true,
      photos: {
        directory: "src/content/photos",
        formats: ["jpg", "jpeg", "png", "webp"],
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
      },
      ai: {
        enabled: false,
        provider: "claude",
        model: "claude-3-haiku-20240307",
        maxTokens: 400,
        temperature: 0.9,
      },
      geolocation: {
        enabled: true,
        privacy: {
          enabled: true,
          radius: 1000,
          method: "blur",
        },
      },
      gallery: {
        itemsPerPage: 20,
        gridCols: {
          mobile: 2,
          tablet: 3,
          desktop: 4,
        },
        enableMap: true,
        enableTags: true,
        enableSearch: false,
      },
      seo: {
        generateOpenGraph: true,
      },
    };

    // 1. Load from config file if it exists
    const configFromFile = await this.loadConfigFile(workingDir);
    if (configFromFile) {
      config = this.deepMerge(config, configFromFile);
    }

    // 2. Override with environment variables
    const configFromEnv = this.loadConfigFromEnv();
    config = this.deepMerge(config, configFromEnv);

    // 3. Override with provided options (highest priority)
    if (providedOptions) {
      config = this.deepMerge(config, providedOptions);
    }

    // Validate final configuration
    const validatedConfig = integrationOptionsSchema.parse(config);
    this.config = validatedConfig;

    return validatedConfig;
  }

  /**
   * Load configuration from astro-photostream.config.js file
   */
  private async loadConfigFile(
    cwd: string,
  ): Promise<Partial<ConfigFile> | null> {
    const possiblePaths = [
      "astro-photostream.config.js",
      "astro-photostream.config.mjs",
      "astro-photostream.config.ts",
    ];

    for (const configPath of possiblePaths) {
      const fullPath = path.join(cwd, configPath);

      try {
        await fs.access(fullPath);

        // Dynamic import to load the config file
        const configModule = await import(`file://${fullPath}`);
        const rawConfig = configModule.default || configModule;

        // Validate the config file structure
        const validatedConfig = configFileSchema.parse(rawConfig);
        console.log(`✅ Loaded configuration from ${configPath}`);
        return validatedConfig;
      } catch (error) {
        // File doesn't exist or has errors, continue to next
        if (
          error instanceof Error &&
          "code" in error &&
          error.code !== "ENOENT"
        ) {
          console.warn(
            `⚠️  Error loading config file ${configPath}:`,
            error.message,
          );
        }
        continue;
      }
    }

    return null;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfigFromEnv(): Partial<IntegrationOptions> {
    const envConfig: any = {};

    // AI configuration from environment
    if (process.env.ANTHROPIC_API_KEY) {
      envConfig.ai = {
        enabled: true,
        provider: "claude",
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL,
        prompt: process.env.ANTHROPIC_PROMPT,
      };
    }

    if (process.env.OPENAI_API_KEY) {
      envConfig.ai = {
        ...envConfig.ai,
        enabled: true,
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || "gpt-4-vision-preview",
      };
    }

    // Geolocation configuration from environment
    if (process.env.OPENCAGE_API_KEY) {
      envConfig.geolocation = {
        enabled: true,
        apiKey: process.env.OPENCAGE_API_KEY,
      };
    }

    // Directory configuration from environment
    if (process.env.CONTENT_DIRECTORY) {
      envConfig.photos = {
        directory: process.env.CONTENT_DIRECTORY,
      };
    }

    if (process.env.PHOTOS_DIRECTORY) {
      envConfig.photos = {
        ...envConfig.photos,
        assetsDirectory: process.env.PHOTOS_DIRECTORY,
      };
    }

    return envConfig;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] === null || source[key] === undefined) {
        continue;
      }

      if (typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Get current configuration
   */
  getConfig(): IntegrationOptions {
    if (!this.config) {
      throw new Error("Configuration not loaded. Call loadConfig() first.");
    }
    return this.config;
  }

  /**
   * Generate example configuration file
   */
  generateExampleConfig(): string {
    return `// astro-photostream.config.js
export default {
  // Enable/disable the integration
  enabled: true,
  
  // Photo processing configuration
  photos: {
    directory: 'src/content/photos',           // Directory for photo markdown (.md) files
    assetsDirectory: 'src/assets/photos',      // Photo assets directory
    formats: ['jpg', 'jpeg', 'png', 'webp'],  // Supported formats
    maxWidth: 1920,                           // Max width for processing
    maxHeight: 1080,                          // Max height for processing
    quality: 85                               // JPEG quality (1-100)
  },
  
  // AI metadata generation
  ai: {
    enabled: false,                           // Enable AI analysis
    provider: 'claude',                       // 'claude' | 'openai' | 'custom'
    apiKey: process.env.ANTHROPIC_API_KEY,    // API key (use env var)
    model: 'claude-3-haiku-20240307',         // Model to use
    prompt: undefined,                        // Custom prompt (optional)
    maxTokens: 400,                          // Max tokens for response
    temperature: 0.9                         // Creativity level (0-2)
  },
  
  // Geolocation processing
  geolocation: {
    enabled: true,                            // Enable location processing
    apiKey: process.env.OPENCAGE_API_KEY,     // OpenCage API key
    privacy: {
      enabled: true,                          // Enable privacy protection
      radius: 1000,                          // Privacy radius in meters
      method: 'blur'                         // 'blur' | 'offset' | 'disable'
    }
  },
  
  // Gallery display options
  gallery: {
    itemsPerPage: 20,                        // Photos per page
    gridCols: {
      mobile: 2,                             // Grid columns on mobile
      tablet: 3,                             // Grid columns on tablet
      desktop: 4                             // Grid columns on desktop
    },
    enableMap: true,                         // Show location maps
    enableTags: true,                        // Enable tag filtering
    enableSearch: false                      // Enable search (future)
  },
  
  // SEO and social media
  seo: {
    generateOpenGraph: true,                 // Generate OG images
    siteName: 'My Photo Gallery',            // Site name for OG
    twitterHandle: '@myhandle'               // Twitter handle
  }
};`;
  }

  /**
   * Write example configuration file to disk
   */
  async writeExampleConfig(filePath?: string): Promise<void> {
    const configPath = filePath || "astro-photostream.config.js";
    const content = this.generateExampleConfig();

    await fs.writeFile(configPath, content, "utf8");
    console.log(`✅ Created example configuration file: ${configPath}`);
  }
}

// Export convenience functions
export const configManager = ConfigManager.getInstance();

/**
 * Load configuration with smart defaults
 */
export async function loadConfig(
  providedOptions?: Partial<IntegrationOptions>,
  cwd?: string,
): Promise<IntegrationOptions> {
  return configManager.loadConfig(providedOptions, cwd);
}

/**
 * Get current configuration
 */
export function getConfig(): IntegrationOptions {
  return configManager.getConfig();
}
