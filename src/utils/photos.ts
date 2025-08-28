/**
 * Photo Data Utilities
 * Based on reference implementation patterns
 * Utility functions for processing and organizing photo data
 */
import { getCollection } from 'astro:content';
import type { PhotoMetadata } from '../types.js';

/**
 * Get all photos with optional filtering and sorting
 */
export async function getAllPhotos(options?: {
  includeDrafts?: boolean;
  sortBy?: 'date' | 'title' | 'camera';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}): Promise<PhotoMetadata[]> {
  const {
    includeDrafts = false,
    sortBy = 'date',
    sortOrder = 'desc',
    limit,
  } = options || {};

  // Get photos from content collection
  const allPhotos = await getCollection(
    'photos',
    ({ data }: { data: unknown }) => {
      return includeDrafts || !data.draft;
    }
  );

  // Convert to PhotoMetadata format
  const photos: PhotoMetadata[] = allPhotos.map((photo: unknown) => ({
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
  }));

  // Sort photos
  const sortedPhotos = photos.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = a.publishDate.getTime() - b.publishDate.getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'camera':
        comparison = (a.camera || '').localeCompare(b.camera || '');
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Apply limit if specified
  return limit ? sortedPhotos.slice(0, limit) : sortedPhotos;
}

/**
 * Get photos by tag
 */
export async function getPhotosByTag(
  tag: string,
  options?: {
    sortBy?: 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  }
): Promise<PhotoMetadata[]> {
  const photos = await getAllPhotos({
    sortBy: options?.sortBy,
    sortOrder: options?.sortOrder,
  });
  const filteredPhotos = photos.filter(photo => photo.tags.includes(tag));

  return options?.limit
    ? filteredPhotos.slice(0, options.limit)
    : filteredPhotos;
}

/**
 * Get all unique tags with photo counts
 */
export async function getAllTags(): Promise<
  Array<{ tag: string; count: number }>
> {
  const photos = await getAllPhotos();
  const tagCounts = new Map<string, number>();

  photos.forEach(photo => {
    photo.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get photos with location data
 */
export async function getPhotosWithLocation(): Promise<PhotoMetadata[]> {
  const photos = await getAllPhotos();
  return photos.filter(
    photo => photo.location?.latitude && photo.location?.longitude
  );
}

/**
 * Get date range for a set of photos
 */
export function getDateRange(photos: PhotoMetadata[]): {
  startDate: Date | null;
  endDate: Date | null;
  yearRange: string;
} {
  if (photos.length === 0) {
    return { startDate: null, endDate: null, yearRange: '' };
  }

  const dates = photos
    .map(p => p.publishDate)
    .sort((a, b) => a.getTime() - b.getTime());
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  const yearRange =
    startYear === endYear ? startYear.toString() : `${startYear} - ${endYear}`;

  return { startDate, endDate, yearRange };
}

/**
 * Get featured locations (locations with most photos)
 */
export async function getFeaturedLocations(limit = 5): Promise<
  Array<{
    name: string;
    count: number;
    coordinates: { latitude: number; longitude: number };
    photos: PhotoMetadata[];
  }>
> {
  const photos = await getPhotosWithLocation();
  const locationCounts = new Map<
    string,
    {
      count: number;
      coordinates: { latitude: number; longitude: number };
      photos: PhotoMetadata[];
    }
  >();

  photos.forEach(photo => {
    if (
      photo.location?.name &&
      photo.location.latitude &&
      photo.location.longitude
    ) {
      const key = photo.location.name;
      const existing = locationCounts.get(key);

      if (existing) {
        existing.count++;
        existing.photos.push(photo);
      } else {
        locationCounts.set(key, {
          count: 1,
          coordinates: {
            latitude: photo.location.latitude,
            longitude: photo.location.longitude,
          },
          photos: [photo],
        });
      }
    }
  });

  return Array.from(locationCounts.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get camera statistics
 */
export async function getCameraStats(): Promise<
  Array<{
    camera: string;
    count: number;
    photos: PhotoMetadata[];
  }>
> {
  const photos = await getAllPhotos();
  const cameraCounts = new Map<string, PhotoMetadata[]>();

  photos.forEach(photo => {
    if (photo.camera) {
      const existing = cameraCounts.get(photo.camera);
      if (existing) {
        existing.push(photo);
      } else {
        cameraCounts.set(photo.camera, [photo]);
      }
    }
  });

  return Array.from(cameraCounts.entries())
    .map(([camera, photos]) => ({ camera, count: photos.length, photos }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get related photos based on tags
 */
export function getRelatedPhotos(
  currentPhoto: PhotoMetadata,
  allPhotos: PhotoMetadata[],
  limit = 4
): PhotoMetadata[] {
  // Calculate tag overlap scores
  const scored = allPhotos
    .filter(photo => photo.id !== currentPhoto.id)
    .map(photo => {
      const commonTags = photo.tags.filter(tag =>
        currentPhoto.tags.includes(tag)
      );
      return {
        photo,
        score: commonTags.length,
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // Sort by score first, then by date
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.photo.publishDate.getTime() - a.photo.publishDate.getTime();
    });

  return scored.slice(0, limit).map(item => item.photo);
}

/**
 * Generate dynamic page description
 */
export function generatePageDescription(
  photos: PhotoMetadata[],
  context?: {
    tag?: string;
    page?: number;
    totalPages?: number;
  }
): string {
  if (photos.length === 0) {
    return 'No photos found.';
  }

  const { yearRange } = getDateRange(photos);
  const photoCount = photos.length;
  const hasLocations = photos.some(p => p.location?.name);

  let description = `${photoCount} photograph${photoCount !== 1 ? 's' : ''}`;

  if (context?.tag) {
    description += ` tagged with "${context.tag}"`;
  }

  if (yearRange) {
    description += ` from ${yearRange}`;
  }

  if (context?.page && context?.totalPages && context.page > 1) {
    description += ` (page ${context.page} of ${context.totalPages})`;
  }

  if (hasLocations) {
    const locationCount = photos.filter(p => p.location?.name).length;
    description += `. ${locationCount} with location data`;
  }

  description += '.';

  return description;
}

/**
 * Group photos by time period
 */
export function groupPhotosByPeriod(
  photos: PhotoMetadata[],
  period: 'year' | 'month' | 'day' = 'year'
): Array<{ period: string; photos: PhotoMetadata[] }> {
  const groups = new Map<string, PhotoMetadata[]>();

  photos.forEach(photo => {
    let key: string;
    const date = photo.publishDate;

    switch (period) {
      case 'year':
        key = date.getFullYear().toString();
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
    }

    const existing = groups.get(key);
    if (existing) {
      existing.push(photo);
    } else {
      groups.set(key, [photo]);
    }
  });

  return Array.from(groups.entries())
    .map(([period, photos]) => ({ period, photos }))
    .sort((a, b) => b.period.localeCompare(a.period));
}

/**
 * Calculate photo statistics
 */
export async function getPhotoStatistics(): Promise<{
  total: number;
  withLocations: number;
  uniqueTags: number;
  uniqueCameras: number;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
    yearRange: string;
  };
  topTags: Array<{ tag: string; count: number }>;
  topCameras: Array<{ camera: string; count: number }>;
  topLocations: Array<{ name: string; count: number }>;
}> {
  const photos = await getAllPhotos();
  const tags = await getAllTags();
  const cameras = await getCameraStats();
  const locations = await getFeaturedLocations();
  const photosWithLocation = await getPhotosWithLocation();

  return {
    total: photos.length,
    withLocations: photosWithLocation.length,
    uniqueTags: tags.length,
    uniqueCameras: cameras.length,
    dateRange: getDateRange(photos),
    topTags: tags.slice(0, 10),
    topCameras: cameras.slice(0, 5),
    topLocations: locations.slice(0, 5),
  };
}
