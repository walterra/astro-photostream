# Fix GitHub issue #11

**Status:** In Progress
**Created:** 2025-09-02T23:43:46Z
**Started:** 2025-09-02T23:44:15Z
**Agent PID:** 12180

## Description

Individual photo pages with location data fail to load due to MapImage component receiving incorrect props. The component expects `latitude`, `longitude`, and `locationName` as individual props, but is currently receiving the entire `photoMetadata` object as a `photo` prop. This causes a "Cannot read properties of undefined (reading 'toFixed')" error when the component tries to call `.toFixed()` on undefined latitude/longitude values.

## Success Criteria

- [x] **Functional**: Individual photo pages with location data load without errors
- [x] **Functional**: MapImage components render correctly on photo detail pages
- [x] **Functional**: Location maps display proper coordinates and location names
- [x] **Quality**: All TypeScript type checks pass (`pnpm check`)
- [x] **Quality**: All linting passes (`pnpm lint`)
- [x] **Quality**: Code formatting is correct (`pnpm format:check`)
- [x] **User validation**: Manual test of individual photo page with location data works
- [x] **User validation**: Verify map displays correctly with proper zoom and styling

## Implementation Plan

- [x] **Code change**: Fix MapImage props in `/src/routes/photos/[slug].content.astro` line 181-185 (pass individual location props instead of photo object)
- [x] **Code change**: Fix MapImage props in `/src/routes/photos/[slug].content.astro` line 359-363 (fallback mode - same fix)
- [x] **Code change**: Fix MapImage props in `/src/routes/photos/[slug].astro` line 309-315 (same prop structure fix)
- [x] **Quality check**: Run TypeScript type checking (`pnpm check`)
- [x] **Quality check**: Run linting (`pnpm lint`)
- [x] **Quality check**: Check code formatting (`pnpm format:check`)
- [x] **User test**: Navigate to individual photo page with location data and verify it loads
- [x] **User test**: Verify map component displays with correct coordinates and styling

## Original Todo

Fix https://github.com/walterra/astro-photostream/issues/11
