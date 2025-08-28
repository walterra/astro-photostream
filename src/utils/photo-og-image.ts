import { Resvg } from "@resvg/resvg-js";
import satori, { type SatoriOptions } from "satori";
import { getCollection, type CollectionEntry } from "astro:content";
import path from "path";
import sharp from "sharp";

// Dynamic font loading for Satori
const getFallbackFont = async (): Promise<ArrayBuffer> => {
	try {
		// Use a TTF font instead of WOFF2 since Satori doesn't support WOFF2
		const fontUrl = 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.ttf';
		const response = await fetch(fontUrl);
		if (!response.ok) throw new Error('Font fetch failed');
		return response.arrayBuffer();
	} catch (error) {
		console.warn('Failed to load font, falling back to minimal font buffer');
		// Create a minimal valid TTF header - this won't work for actual rendering
		// but should prevent Satori from crashing
		const buffer = new ArrayBuffer(12);
		const view = new DataView(buffer);
		// TTF magic number
		view.setUint32(0, 0x00010000);
		view.setUint16(4, 0); // numTables
		view.setUint16(6, 0); // searchRange
		view.setUint16(8, 0); // entrySelector
		view.setUint16(10, 0); // rangeShift
		return buffer;
	}
};

export const getOgOptions = async (): Promise<SatoriOptions> => {
	const fontData = await getFallbackFont();
	return {
		fonts: [
			{
				name: 'Inter',
				data: Buffer.from(fontData),
				weight: 400,
				style: 'normal',
			}
		],
		height: 630,
		width: 1200,
	};
};

export const getDateRange = (photos: CollectionEntry<"photos">[]) => {
	if (photos.length === 0) return null;
	
	const dates = photos
		.map(p => p.data.datePublished || p.data.dateTaken)
		.filter(Boolean)
		.sort((a, b) => a.getTime() - b.getTime());
	
	if (dates.length === 0) return null;
	
	const earliest = dates[0];
	const latest = dates[dates.length - 1];
	
	if (!earliest || !latest) return null;
	
	const earliestYear = earliest.getFullYear();
	const latestYear = latest.getFullYear();
	
	if (earliestYear === latestYear) {
		return { year: earliestYear, type: 'single' as const };
	}
	return { years: `${earliestYear}-${latestYear}`, type: 'range' as const };
};

export const getFeaturedLocations = (photos: CollectionEntry<"photos">[]) => {
	const locationCounts = photos
		.map(p => p.data.location?.name)
		.filter(Boolean)
		.reduce<Record<string, number>>((acc, location) => {
			if (location) {
				acc[location] = (acc[location] || 0) + 1;
			}
			return acc;
		}, {});
	
	return Object.entries(locationCounts)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 2)
		.map(([location]) => location);
};

export const getTopTags = (photos: CollectionEntry<"photos">[]) => {
	const tagCounts = photos
		.flatMap(p => p.data.tags || [])
		.filter(tag => !tag.startsWith('y20')) // Filter out year tags
		.reduce<Record<string, number>>((acc, tag) => {
			acc[tag] = (acc[tag] || 0) + 1;
			return acc;
		}, {});
	
	return Object.entries(tagCounts)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 3)
		.map(([tag]) => tag);
};

export const renderPhoto = (photo: { src: string; alt: string } | null | undefined, index: number) => {
	if (photo && photo.src) {
		// Image with flex sizing
		return {
			type: 'img',
			props: {
				src: photo.src,
				alt: photo.alt,
				style: {
					flex: '1',
					height: '100%',
					objectFit: 'cover',
					borderRadius: '8px',
				},
			},
		};
	}
	// Placeholder with flex sizing
	return {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flex: '1',
				height: '100%',
				borderRadius: '8px',
				backgroundColor: '#2a2d31',
				color: '#8e9199',
				fontSize: '14px',
			},
			children: `${index + 1}`,
		},
	};
};

export const createPhotoGridMarkup = (title: string, subtitle: string, details: string, photos: Array<{ src: string; alt: string }>) => {
	// Ensure we have exactly 9 slots, filling with nulls if needed
	const photoSlots: Array<{ src: string; alt: string } | null> = Array(9).fill(null);
	photos.slice(0, 9).forEach((photo, i) => {
		if (photo && photo.src) {
			photoSlots[i] = photo;
		}
	});
	
	return {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				width: '100%',
				height: '100%',
				backgroundColor: '#1d1f21',
				color: '#c9cacc',
				fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			},
			children: [
				// Left side - Text content (50% width)
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							width: '50%',
							padding: '32px',
						},
						children: [
							{
								type: 'p',
								props: {
									style: {
										fontSize: '20px',
										marginBottom: '12px',
										color: '#2bbc89',
									},
									children: subtitle,
								},
							},
							{
								type: 'h1',
								props: {
									style: {
										fontSize: '36px',
										fontWeight: '700',
										lineHeight: '1.2',
										color: 'white',
										marginBottom: '16px',
									},
									children: title,
								},
							},
							{
								type: 'p',
								props: {
									style: {
										fontSize: '16px',
										color: '#8e9199',
										lineHeight: '1.5',
									},
									children: details,
								},
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										alignItems: 'center',
										marginTop: '24px',
										paddingTop: '16px',
										borderTop: '1px solid #2bbc89',
										fontSize: '18px',
									},
									children: {
										type: 'p',
										props: {
											style: {
												fontWeight: '700',
											},
											children: 'Photo Gallery', // We'll make this configurable later
										},
									},
								},
							},
						],
					},
				},
				// Right side - Photo grid (50% width, 3x3 grid)
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							width: '50%',
							padding: '20px',
							gap: '8px',
						},
						children: [
							// Top row
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										gap: '8px',
										height: '181px',
									},
									children: [
										renderPhoto(photoSlots[0], 0),
										renderPhoto(photoSlots[1], 1),
										renderPhoto(photoSlots[2], 2),
									],
								},
							},
							// Middle row
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										gap: '8px',
										height: '181px',
									},
									children: [
										renderPhoto(photoSlots[3], 3),
										renderPhoto(photoSlots[4], 4),
										renderPhoto(photoSlots[5], 5),
									],
								},
							},
							// Bottom row
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										gap: '8px',
										height: '181px',
									},
									children: [
										renderPhoto(photoSlots[6], 6),
										renderPhoto(photoSlots[7], 7),
										renderPhoto(photoSlots[8], 8),
									],
								},
							},
						],
					},
				},
			],
		},
	};
};

export const processPhotoImages = async (photos: CollectionEntry<"photos">[], maxPhotos = 9) => {
	const photoData: Array<{ src: string; alt: string }> = [];
	
	for (let i = 0; i < Math.min(photos.length, maxPhotos); i++) {
		const photo = photos[i];
		try {
			// Handle Astro image objects - check if we're in production build or dev mode
			let imageSrc: string;
			let useProcessedImage = false;
			
			if (photo && photo.data.coverImage.src && typeof photo.data.coverImage.src === 'object' && 'src' in photo.data.coverImage.src) {
				// Astro image object - use processed image for production builds
				const processedSrc = photo.data.coverImage.src.src;
				
				// In production, use the processed image directly if it's a data URL or valid processed path
				if (processedSrc && (processedSrc.startsWith('data:') || processedSrc.startsWith('/_astro/'))) {
					// For production builds, try to get the image as base64
					if (processedSrc.startsWith('data:')) {
						photoData.push({
							src: processedSrc,
							alt: photo?.data.coverImage.alt || photo?.data.title || 'Photo'
						});
						continue;
					}
					useProcessedImage = true;
					imageSrc = processedSrc;
				} else {
					// Development mode - use the raw source path
					let rawSrc = processedSrc;
					
					// Remove /@fs prefix and query parameters
					if (rawSrc.startsWith('/@fs')) {
						rawSrc = rawSrc.substring(4); // Remove /@fs prefix
					}
					
					// Remove query parameters
					const queryIndex = rawSrc.indexOf('?');
					if (queryIndex !== -1) {
						rawSrc = rawSrc.substring(0, queryIndex);
					}
					
					imageSrc = rawSrc;
				}
			} else if (photo && typeof photo.data.coverImage.src === 'string') {
				imageSrc = photo.data.coverImage.src;
			} else {
				console.error('Invalid coverImage structure for photo:', photo?.id, photo?.data.coverImage);
				continue;
			}
			
			// Skip processing if we already have a data URL
			if (imageSrc.startsWith('data:')) {
				photoData.push({
					src: imageSrc,
					alt: photo?.data.coverImage.alt || photo?.data.title || 'Photo'
				});
				continue;
			}
			
			// Handle processed images in production builds
			if (useProcessedImage && imageSrc.startsWith('/_astro/')) {
				// In production build, the image might be in the dist folder
				// Use process.cwd() to get the current working directory dynamically
				const distPath = path.resolve(process.cwd(), 'dist', imageSrc.substring(1)); // Remove leading /
				
				try {
					// Use Sharp to resize image to exact grid dimensions
					const resizedBuffer = await sharp(distPath)
						.resize(181, 181, { 
							fit: 'cover', 
							position: 'center',
							kernel: 'lanczos3'
						})
						.jpeg({ quality: 85 })
						.toBuffer();
					
					const base64Image = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
					
					photoData.push({
						src: base64Image,
						alt: photo?.data.coverImage.alt || photo?.data.title || 'Photo'
					});
					continue;
				} catch (distError) {
					console.error(`Failed to process production image: ${distPath}`, distError);
					// Fall through to try original source path
				}
			}
			
			// Convert to absolute file path for development mode
			let absolutePath: string;
			const projectRoot = process.cwd();
			
			if (path.isAbsolute(imageSrc)) {
				// Already an absolute path from Astro processing
				absolutePath = imageSrc;
			} else if (imageSrc.startsWith('../../assets/')) {
				// Standard relative path from photo content directory
				absolutePath = path.resolve(projectRoot, 'src/content/photos/', imageSrc);
			} else if (imageSrc.startsWith('/src/assets/')) {
				// Absolute path from project root
				absolutePath = path.resolve(projectRoot, imageSrc.substring(1)); // Remove leading /
			} else {
				// Try relative path resolution as fallback
				absolutePath = path.resolve(projectRoot, 'src/content/photos/', imageSrc);
			}
			
			// Check if file exists and resize with Sharp for better quality
			try {
				// Use Sharp to resize image to exact grid dimensions with high-quality resampling
				const resizedBuffer = await sharp(absolutePath)
					.resize(181, 181, { 
						fit: 'cover', 
						position: 'center',
						// Use high-quality Lanczos3 resampling for best anti-aliasing
						kernel: 'lanczos3'
					})
					.jpeg({ quality: 85 }) // High quality JPEG output
					.toBuffer();
				
				const base64Image = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
				
				photoData.push({
					src: base64Image,
					alt: photo?.data.coverImage.alt || photo?.data.title || 'Photo'
				});
			} catch (fileError) {
				console.error(`Failed to process image file: ${absolutePath}`, fileError);
				continue;
			}
		} catch (error) {
			console.error('Error processing photo:', photo?.id, error);
			continue;
		}
	}
	
	return photoData;
};

export const generateOgImage = async (title: string, subtitle: string, details: string, photos: Array<{ src: string; alt: string }>) => {
	const options = await getOgOptions();
	const svg = await satori(createPhotoGridMarkup(title, subtitle, details, photos), options);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
};