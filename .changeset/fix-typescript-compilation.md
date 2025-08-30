---
'astro-photostream': patch
---

Fix TypeScript compilation errors in core integration files

- Fix Vite config type error by changing `config: unknown` to `config:
any` in src/index.ts
- Fix image function type error by updating parameter from `{ image:
unknown }` to `{ image: () => any }` in src/schema.ts
- Fix photo config partial assignment errors with proper type assertions
  in src/utils/config.ts
- Add missing geolocation privacy property with default blur
  configuration
- Fix unused parameter warning in metadata constructor by using
  `this.options`
- Clean up code formatting to pass all quality checks
