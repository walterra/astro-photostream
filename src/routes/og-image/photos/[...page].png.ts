import type { APIContext, InferGetStaticPropsType } from "astro";
import { getCollection } from "astro:content";
import { 
	getDateRange, 
	getFeaturedLocations, 
	getTopTags, 
	processPhotoImages, 
	generateOgImage 
} from "../../../utils/photo-og-image";
import { config } from "virtual:astro-photostream/config";

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { title, photos, photoCount, startPhoto, endPhoto } = context.props as Props;

	const dateRange = getDateRange(photos);
	const featuredLocations = getFeaturedLocations(photos);
	const topTags = getTopTags(photos);

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
	const photoData = await processPhotoImages(photos);

	// Generate OG image with shared utility
	return generateOgImage(title, subtitle, details, photoData);
}

export async function getStaticPaths() {
	const MAX_PHOTOS_PER_PAGE = config.photosPerPage || 12;
	
	// Get all photos from content collection
	const allPhotos = await getCollection("photos", ({ data }) => {
		return data.draft !== true;
	});
	
	// Sort photos by slug (most recent first based on YYYY-MM-DD format)
	const sortedPhotos = allPhotos.sort((a, b) => b.slug.localeCompare(a.slug));
	
	const totalPhotos = sortedPhotos.length;
	const totalPages = Math.ceil(totalPhotos / MAX_PHOTOS_PER_PAGE);

	const paths = [];
	
	for (let page = 1; page <= totalPages; page++) {
		const startIndex = (page - 1) * MAX_PHOTOS_PER_PAGE;
		const endIndex = Math.min(startIndex + MAX_PHOTOS_PER_PAGE, totalPhotos);
		const pagePhotos = sortedPhotos.slice(startIndex, endIndex);

		const siteName = config.seo?.siteName || "Photo Gallery";
		const title = page === 1 
			? siteName
			: `${siteName} - page ${page} of ${totalPages}`;

		const startPhoto = startIndex + 1;
		const endPhoto = endIndex;

		// Generate path for each page - skip page 1 since it's handled by photos.png.ts
		if (page === 1) continue;
		const pathParam = page.toString();
		
		paths.push({
			params: { page: pathParam },
			props: {
				title,
				photos: pagePhotos,
				photoCount: totalPhotos,
				startPhoto,
				endPhoto,
			},
		});
	}

	return paths;
}