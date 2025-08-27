---
"astro-photostream": patch
---

Fix JSX fragment syntax error in tag pagination component

**Bug Fix:**
- Fixed Astro build error: "Unable to assign attributes when using <> Fragment shorthand syntax"
- Applied consistent JSX pattern from commit 218d1b24f: early return with null and simple ternary
- Tag-based photo filtering pagination now builds correctly

**Impact:**
- Projects using astro-photostream now build without JSX syntax errors
- Tag filtering feature works properly in production builds
- No breaking changes to functionality