---
'astro-photostream': patch
---

fix(cli): correct build output path for CLI binaries

Fixed TypeScript compilation issue that was creating nested `dist/scripts/scripts/` directory structure. The CLI binaries are now correctly built to `dist/scripts/` to match the package.json bin configuration, resolving npm installation warnings about missing binary files.
