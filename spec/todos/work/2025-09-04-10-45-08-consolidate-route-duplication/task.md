# we have a lot of code duplication because of the routes with and without layout wrappers (routes with and without .content.). consolidate!

**Status:** In Progress
**Started:** 2025-09-04T10:45:08Z
**Created:** 2025-09-04T10:45:08Z
**Agent PID:** 93044

## Description

The integration maintains duplicate routes for standalone and layout-wrapped modes, creating significant maintenance overhead. Six route pairs share identical data fetching, photo filtering, sorting, and pagination logic but differ only in presentation layer:

**Route Pairs with Duplication:**

- `src/routes/photos/[...page].astro` + `src/routes/photos/[...page].content.astro`
- `src/routes/photos/[slug].astro` + `src/routes/photos/[slug].content.astro`
- `src/routes/photos/tags/[tag]/[...page].astro` + `src/routes/photos/tags/[tag]/[...page].content.astro`

Standalone routes (.astro) provide complete HTML with SEO metadata while .content routes use layout wrappers with virtual imports. The business logic is 99% identical across pairs, creating maintenance overhead when updating photo processing, pagination, or data fetching functionality.

## Success Criteria

- [ ] **Functional**: All existing photo gallery routes continue to work (standalone and layout-wrapped modes)
- [ ] **Functional**: Photo filtering, sorting, and pagination logic remains identical across all routes
- [ ] **Functional**: SEO metadata and OpenGraph generation continues working for standalone routes
- [ ] **Functional**: Layout wrapper integration continues working for .content routes
- [ ] **Quality**: All TypeScript type checks pass (`pnpm check`)
- [ ] **Quality**: All linting passes (`pnpm lint`)
- [ ] **Quality**: Code formatting is correct (`pnpm format:check`)
- [ ] **Architecture**: Business logic extracted into shared components/utilities
- [ ] **Architecture**: Route duplication reduced by at least 70% (measured by lines of code)
- [ ] **User validation**: Manual test of photo gallery pages in both standalone and layout-wrapped modes
- [ ] **User validation**: Verify pagination, photo detail pages, and tag filtering work correctly
- [ ] **User validation**: Confirm SEO metadata and layout wrapper functionality preserved

## Implementation Plan

- [ ] **Create shared utilities**: Extract data fetching logic into `src/utils/photo-data.ts`, pagination logic into `src/utils/pagination.ts`, and SEO logic into `src/utils/seo.ts`
- [ ] **Create content components**: Build `PhotoGalleryContent.astro`, `PhotoDetailContent.astro`, and `TagPageContent.astro` components to handle reusable UI logic
- [ ] **Update gallery routes**: Refactor `src/routes/photos/[...page].astro` and `[...page].content.astro` to use shared utilities and components (reduce ~1,266 lines to ~200 lines)
- [ ] **Update photo detail routes**: Refactor `src/routes/photos/[slug].astro` and `[slug].content.astro` to use shared utilities and components (reduce ~1,194 lines to ~180 lines)
- [ ] **Update tag routes**: Refactor `src/routes/photos/tags/[tag]/[...page].astro` and `[tag]/[...page].content.astro` to use shared utilities and components (reduce ~1,318 lines to ~220 lines)
- [ ] **Create SeoHead component**: Extract common SEO metadata generation into reusable component
- [ ] **Automated test**: Run TypeScript type checking (`pnpm check`)
- [ ] **Automated test**: Run linting (`pnpm lint`)
- [ ] **Automated test**: Run code formatting check (`pnpm format:check`)
- [ ] **User test**: Verify photo gallery pages work in both standalone and layout-wrapped modes
- [ ] **User test**: Test pagination, photo detail pages, and tag filtering functionality
- [ ] **User test**: Confirm SEO metadata and layout wrapper functionality preserved

## Original Todo

we have a lot of code duplication because of the routes with and without layout wrappers (routes with and without .content.). consolidate!
