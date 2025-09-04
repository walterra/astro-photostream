/**
 * Shared pagination utilities - centralizes pagination logic
 * Eliminates duplication across route files
 */

import type { PaginateFunction } from 'astro';
import {
  getPhotosCollection,
  sortPhotosByDate,
  convertToPhotoMetadata,
  filterPhotosByTag,
} from './photo-data.js';

/**
 * Create standard photo pagination for gallery routes
 */
export async function createPhotoPagination(
  paginate: PaginateFunction,
  itemsPerPage: number,
  config: any
) {
  const allPhotos = await getPhotosCollection();
  const sortedPhotos = sortPhotosByDate(allPhotos);
  const photos = sortedPhotos.map(convertToPhotoMetadata);

  return paginate(photos, {
    pageSize: itemsPerPage,
    props: {
      totalPhotos: photos.length,
      config,
    },
  });
}

/**
 * Create tag-specific pagination for tag filtering routes
 */
export async function createTagPagination(
  paginate: PaginateFunction,
  tag: string,
  itemsPerPage: number,
  config: any
) {
  const allPhotos = await getPhotosCollection();
  const taggedPhotos = filterPhotosByTag(allPhotos, tag);
  const sortedPhotos = sortPhotosByDate(taggedPhotos);
  const photos = sortedPhotos.map(convertToPhotoMetadata);

  if (photos.length === 0) {
    return [];
  }

  return paginate(photos, {
    pageSize: itemsPerPage,
    props: {
      tag,
      totalPhotos: photos.length,
      config,
    },
  });
}

/**
 * Generate static paths for photo detail pages with navigation context
 */
export async function generatePhotoDetailPaths(): Promise<any[]> {
  const allPhotos = await getPhotosCollection();
  const sortedPhotos = sortPhotosByDate(allPhotos);
  const filteredPhotos = sortedPhotos.filter(
    photo => !/^\d+$/.test(photo.slug)
  );

  return filteredPhotos.map((photo, index) => {
    const prevPhoto = index > 0 ? sortedPhotos[index - 1] : null;
    const nextPhoto =
      index < sortedPhotos.length - 1 ? sortedPhotos[index + 1] : null;

    return {
      params: { slug: photo.slug },
      props: {
        photo,
        prevPhoto: prevPhoto
          ? {
              slug: prevPhoto.slug,
              title: prevPhoto.data.title,
              coverImage: prevPhoto.data.coverImage,
            }
          : null,
        nextPhoto: nextPhoto
          ? {
              slug: nextPhoto.slug,
              title: nextPhoto.data.title,
              coverImage: nextPhoto.data.coverImage,
            }
          : null,
        photoIndex: index + 1,
        totalPhotos: sortedPhotos.length,
      },
    };
  });
}

/**
 * Generate static paths for tag pages
 */
export async function generateTagPaths(): Promise<string[]> {
  const allPhotos = await getPhotosCollection();
  const tags = new Set<string>();

  allPhotos.forEach(photo => {
    photo.data.tags.forEach(tag => tags.add(tag));
  });

  return Array.from(tags);
}

/**
 * Extract pagination metadata from Astro's paginate result
 */
export function getPaginationMetadata(page: any) {
  return {
    photos: page.data,
    currentPage: page.currentPage,
    totalPages: page.lastPage,
    hasNext: page.currentPage < page.lastPage,
    hasPrev: page.currentPage > 1,
    nextUrl: page.url.next,
    prevUrl: page.url.prev,
  };
}
