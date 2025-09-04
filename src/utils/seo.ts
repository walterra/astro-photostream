/**
 * Shared SEO utilities - centralizes SEO and metadata generation
 * Eliminates duplication across route files
 */

import type { PhotoMetadata } from '../types.js';

export interface SeoConfig {
  siteName?: string;
  generateOpenGraph?: boolean;
}

export interface PageSeoData {
  title: string;
  description: string;
  ogImageUrl?: string;
  canonical: string;
  jsonLd?: any;
}

/**
 * Generate page title with site name
 */
export function generatePageTitle(
  pageTitle: string,
  siteName?: string
): string {
  return siteName ? `${pageTitle} - ${siteName}` : pageTitle;
}

/**
 * Generate gallery page metadata
 */
export function generateGalleryPageSeo(
  currentPage: number,
  totalPages: number,
  totalPhotos: number,
  dateRange: string,
  config: SeoConfig,
  url: URL
): PageSeoData {
  const isFirstPage = currentPage === 1;
  const title = isFirstPage
    ? `Photo Gallery`
    : `Photo Gallery - Page ${currentPage}`;

  const description = isFirstPage
    ? `Browse through ${totalPhotos} photographs captured with love for photography and technology. ${dateRange ? `Photos from ${dateRange}.` : ''}`
    : `Browse photographs - page ${currentPage} of ${totalPages}. ${dateRange ? `Photos from ${dateRange} on this page.` : ''}`;

  return {
    title: generatePageTitle(title, config.siteName),
    description,
    ogImageUrl: config.generateOpenGraph
      ? `${url.origin}/og-image/photos/${currentPage}.png`
      : undefined,
    canonical: url.href,
    jsonLd: generateGalleryJsonLd(
      title,
      description,
      url.href,
      config.siteName
    ),
  };
}

/**
 * Generate photo detail page metadata
 */
export function generatePhotoDetailSeo(
  photo: PhotoMetadata,
  photoIndex: number,
  totalPhotos: number,
  config: SeoConfig,
  url: URL
): PageSeoData {
  const title = photo.title;
  const description = photo.description || `Photo: ${photo.title}`;

  return {
    title: generatePageTitle(title, config.siteName),
    description,
    ogImageUrl: config.generateOpenGraph
      ? `/api/og/photo/${photo.id}.png`
      : undefined,
    canonical: url.href,
    jsonLd: generatePhotoJsonLd(
      photo,
      url.href,
      config.siteName,
      photoIndex,
      totalPhotos
    ),
  };
}

/**
 * Generate tag page metadata
 */
export function generateTagPageSeo(
  tag: string,
  currentPage: number,
  totalPages: number,
  totalPhotos: number,
  config: SeoConfig,
  url: URL
): PageSeoData {
  const isFirstPage = currentPage === 1;
  const title = isFirstPage
    ? `Photos tagged "${tag}"`
    : `Photos tagged "${tag}" - Page ${currentPage}`;

  const description = isFirstPage
    ? `Browse ${totalPhotos} photographs tagged with "${tag}".`
    : `Browse photographs tagged with "${tag}" - page ${currentPage} of ${totalPages}.`;

  return {
    title: generatePageTitle(title, config.siteName),
    description,
    ogImageUrl: config.generateOpenGraph
      ? `${url.origin}/og-image/photos/tags/${encodeURIComponent(tag)}/${currentPage}.png`
      : undefined,
    canonical: url.href,
    jsonLd: generateTagPageJsonLd(
      tag,
      title,
      description,
      url.href,
      config.siteName
    ),
  };
}

/**
 * Generate JSON-LD structured data for gallery pages
 */
export function generateGalleryJsonLd(
  title: string,
  description: string,
  url: string,
  siteName?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    publisher: siteName
      ? {
          '@type': 'Organization',
          name: siteName,
        }
      : undefined,
    mainEntity: {
      '@type': 'ImageGallery',
      name: title,
      description,
    },
  };
}

/**
 * Generate JSON-LD structured data for photo detail pages
 */
export function generatePhotoJsonLd(
  photo: PhotoMetadata,
  url: string,
  siteName?: string,
  position?: number,
  totalPhotos?: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    name: photo.title,
    description: photo.description,
    url,
    image: photo.coverImage,
    datePublished: photo.publishDate.toISOString(),
    creator: siteName
      ? {
          '@type': 'Person',
          name: siteName,
        }
      : undefined,
    keywords: photo.tags.join(', '),
    ...(photo.location && {
      contentLocation: {
        '@type': 'Place',
        name: photo.location.name,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: photo.location.latitude,
          longitude: photo.location.longitude,
        },
      },
    }),
    ...(photo.camera && {
      exifData: [
        photo.camera && {
          '@type': 'PropertyValue',
          name: 'Camera',
          value: photo.camera,
        },
        photo.lens && {
          '@type': 'PropertyValue',
          name: 'Lens',
          value: photo.lens,
        },
        photo.settings?.aperture && {
          '@type': 'PropertyValue',
          name: 'Aperture',
          value: photo.settings.aperture,
        },
        photo.settings?.shutterSpeed && {
          '@type': 'PropertyValue',
          name: 'Shutter Speed',
          value: photo.settings.shutterSpeed,
        },
        photo.settings?.iso && {
          '@type': 'PropertyValue',
          name: 'ISO',
          value: photo.settings.iso,
        },
        photo.settings?.focalLength && {
          '@type': 'PropertyValue',
          name: 'Focal Length',
          value: photo.settings.focalLength,
        },
      ].filter(Boolean),
    }),
    ...(position &&
      totalPhotos && {
        position,
        isPartOf: {
          '@type': 'ImageGallery',
          numberOfItems: totalPhotos,
        },
      }),
  };
}

/**
 * Generate JSON-LD structured data for tag pages
 */
export function generateTagPageJsonLd(
  tag: string,
  title: string,
  description: string,
  url: string,
  siteName?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    about: {
      '@type': 'Thing',
      name: tag,
      identifier: tag,
    },
    publisher: siteName
      ? {
          '@type': 'Organization',
          name: siteName,
        }
      : undefined,
    mainEntity: {
      '@type': 'ImageGallery',
      name: title,
      description,
      about: {
        '@type': 'Thing',
        name: tag,
      },
    },
  };
}
