⏺ Based on my research, here's a comprehensive solution for getting ~50 professional-looking,
geolocated Creative Commons photos from Wikimedia Commons with deterministic results:

Professional Quality Selection Strategy:

1. Featured Pictures + Quality Images

- Featured Pictures: ~11,192 images (0.024% of Commons) - highest quality
- Quality Images: ~408,279 images (0.326% of Commons) - good technical quality
- API Categories:
  - Category:Featured_pictures_on_Wikimedia_Commons
  - Category:Quality_images

2. Deterministic Query Approach

# Base API call structure for deterministic results

BASE_URL="https://commons.wikimedia.org/w/api.php"
PARAMS="action=query&generator=categorymembers&gcmtype=file&gcmsort=timestamp&gcmdir=asc&format=jso
n"

# For Featured Pictures with GPS data

FEATURED_QUERY="${BASE_URL}?${PARAMS}&gcmtitle=Category:Featured_pictures_on_Wikimedia_Commons&prop
=imageinfo|coordinates&iiprop=url|extmetadata"

# For Quality Images with GPS data

QUALITY_QUERY="${BASE_URL}?${PARAMS}&gcmtitle=Category:Quality_images&prop=imageinfo|coordinates&ii
prop=url|extmetadata"

3. Implementation Strategy for 50 Photos

def get_professional_geolocated_photos():
photos = []

      # 1. Get Featured Pictures with GPS (highest priority)
      featured_with_gps = query_category_with_coordinates(
          "Category:Featured_pictures_on_Wikimedia_Commons",
          limit=25,
          sort="timestamp",
          direction="asc"  # Deterministic oldest-first
      )

      # 2. Get Quality Images with GPS (fill remaining slots)
      quality_with_gps = query_category_with_coordinates(
          "Category:Quality_images",
          limit=25,
          sort="timestamp",
          direction="asc"
      )

      return featured_with_gps + quality_with_gps

4. Deterministic Sorting Key Points

- Use gcmsort=timestamp&gcmdir=asc for consistent results
- Filter for images with GPS coordinates using prop=coordinates
- Always start from the same timestamp (oldest first) for reproducibility
- Use pagination with consistent continue tokens

5. Quality Filters

Additional filters to ensure professional quality:

- Minimum resolution: 2+ megapixels (already enforced for Quality Images)
- Exclude certain file types if needed
- Filter by aspect ratio for landscape photos
- Check for proper EXIF metadata completeness
