/**
 * Shared photo data utilities - centralizes photo collection and transformation logic
 * Eliminates duplication across route files
 */

import { getCollection } from 'astro:content';
import type { PhotoMetadata } from '../types.js';
import type { CollectionEntry } from 'astro:content';

/**
 * Get all non-draft photos from content collection
 */
export async function getPhotosCollection() {
  return await getCollection('photos', ({ data }) => !data.draft);
}

/**
 * Convert collection entry to PhotoMetadata format
 */
export function convertToPhotoMetadata(
  photo: CollectionEntry<'photos'>
): PhotoMetadata {
  return {
    id: photo.slug,
    title: photo.data.title,
    description: photo.data.description,
    coverImage: photo.data.coverImage,
    camera: photo.data.camera,
    lens: photo.data.lens,
    settings: photo.data.settings,
    location: photo.data.location,
    tags: photo.data.tags,
    publishDate: new Date(photo.data.publishDate),
    draft: photo.data.draft || false,
  };
}

/**
 * Sort photos by publish date (newest first)
 */
export function sortPhotosByDate(
  photos: CollectionEntry<'photos'>[]
): CollectionEntry<'photos'>[] {
  return photos.sort(
    (a, b) =>
      new Date(b.data.publishDate).getTime() -
      new Date(a.data.publishDate).getTime()
  );
}

/**
 * Filter photos by tag
 */
export function filterPhotosByTag(
  photos: CollectionEntry<'photos'>[],
  tag: string
): CollectionEntry<'photos'>[] {
  return photos.filter(photo =>
    photo.data.tags.some(
      photoTag => photoTag.toLowerCase() === tag.toLowerCase()
    )
  );
}

/**
 * Get photos with location data for maps
 */
export function getPhotosWithLocation(
  photos: PhotoMetadata[]
): PhotoMetadata[] {
  return photos.filter(
    photo => photo.location?.latitude && photo.location?.longitude
  );
}

/**
 * Calculate date range from photos array
 */
export function calculateDateRange(photos: PhotoMetadata[]): string {
  if (photos.length === 0) return '';

  const dates = photos
    .map(p => p.publishDate)
    .sort((a, b) => b.getTime() - a.getTime());
  const newestDate = dates[0];
  const oldestDate = dates[dates.length - 1];

  return newestDate && oldestDate && newestDate !== oldestDate
    ? `${oldestDate.getFullYear()} - ${newestDate.getFullYear()}`
    : newestDate?.getFullYear().toString() || '';
}

/**
 * Get related tags from photos (excluding current tag)
 */
export function getRelatedTags(
  photos: PhotoMetadata[],
  currentTag?: string
): string[] {
  const tagCounts = new Map<string, number>();

  photos.forEach(photo => {
    photo.tags.forEach(tag => {
      if (tag !== currentTag) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    });
  });

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

/**
 * Filter photos with numeric-only slugs to avoid pagination conflicts
 */
export function filterNonNumericSlugs(
  photos: CollectionEntry<'photos'>[]
): CollectionEntry<'photos'>[] {
  return photos.filter(photo => !/^\d+$/.test(photo.slug));
}
