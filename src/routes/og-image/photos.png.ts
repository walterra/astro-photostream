import { getCollection } from "astro:content";
import { 
	getDateRange, 
	getFeaturedLocations, 
	getTopTags, 
	processPhotoImages, 
	generateOgImage 
} from "../../utils/photo-og-image";
import { config } from "virtual:astro-photostream/config";

export async function GET() {
	const MAX_PHOTOS_PER_PAGE = config.photosPerPage || 12;
	
	// Get all photos from content collection
	const allPhotos = await getCollection("photos", ({ data }) => {
		return data.draft !== true;
	});
	
	// Sort photos by slug (most recent first based on YYYY-MM-DD format)
	const sortedPhotos = allPhotos.sort((a, b) => b.slug.localeCompare(a.slug));
	
	const totalPhotos = sortedPhotos.length;
	
	// First page: photos 1-12 (or configured per page)
	const pagePhotos = sortedPhotos.slice(0, MAX_PHOTOS_PER_PAGE);
	const title = config.seo?.siteName || "Photo Gallery";
	const photoCount = totalPhotos;
	const startPhoto = 1;
	const endPhoto = Math.min(MAX_PHOTOS_PER_PAGE, totalPhotos);

	const dateRange = getDateRange(pagePhotos);
	const featuredLocations = getFeaturedLocations(pagePhotos);
	const topTags = getTopTags(pagePhotos);

	const subtitle = `${startPhoto}-${endPhoto} of ${photoCount} photos`;
	
	let details = `Photography collection`;
	if (dateRange) {
		if (dateRange.type === 'single') {
			details += ` from ${dateRange.year}`;
		} else {
			details += ` spanning ${dateRange.years}`;
		}
	}
	if (featuredLocations.length > 0) {
		details += ` • ${featuredLocations.join(" & ")}`;
	}
	if (topTags.length > 0) {
		details += ` • ${topTags.join(", ")}`;
	}

	// Process photos with shared utility
	const photoData = await processPhotoImages(pagePhotos);

	// Generate OG image with shared utility
	return generateOgImage(title, subtitle, details, photoData);
}