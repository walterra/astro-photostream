# Create demo photo fetch script for Creative Commons photos

**Status:** In Progress
**Created:** 2025-08-22T14:34:00
**Started:** 2025-08-22T14:34:00
**Agent PID:** 6815

## Original Todo

- our demo should be based on public creative commons photos. `spec/sample-library.md` describes how to get the photos. create a script in demo that is able to fetch the photos and put it in a location where the metadata generation script can pick it up.

## Description

Create a script that fetches high-quality, geolocated Creative Commons photos from Wikimedia Commons and downloads them to the demo's assets directory where the existing metadata generation script can process them, making the demo self-contained with real Creative Commons content.

## Success Criteria

- [ ] Functional: Script successfully fetches ~50 professional Creative Commons photos from Wikimedia Commons with GPS coordinates
- [ ] Functional: Photos are downloaded to `demo/src/assets/photos/` directory in proper format (JPG/PNG)
- [ ] Functional: Downloaded photos can be processed by existing metadata generation script without errors
- [ ] Functional: Script uses deterministic sorting (timestamp-based) for reproducible results
- [ ] Quality: Script handles network errors gracefully with retry logic
- [ ] Quality: All TypeScript code passes type checking
- [ ] Quality: Downloaded photos have valid EXIF data including GPS coordinates
- [ ] User validation: Manual test confirms photos are fetched and metadata can be generated
- [ ] User validation: Demo site displays local photos instead of external Unsplash URLs
- [ ] Documentation: Script usage documented in demo README.md

## Implementation Plan

- [ ] Create `demo/scripts/` directory for the fetch script
- [ ] Implement `demo/scripts/fetch-photos.ts` with Wikimedia Commons API integration
- [ ] Add npm script in `demo/package.json` for `npm run fetch-photos`
- [ ] Create `demo/src/assets/photos/` directory for metadata generation
- [ ] Test script execution: `cd demo && npm run fetch-photos`
- [ ] Automated test: Verify photos are downloaded with valid EXIF/GPS data
- [ ] Automated test: Run metadata generator on fetched photos
- [ ] User test: Manually verify demo displays local photos instead of Unsplash URLs
- [ ] User test: Confirm demo site builds and runs with fetched photos
- [ ] Update demo README.md with fetch-photos script documentation