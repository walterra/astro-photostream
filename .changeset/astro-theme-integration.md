---
'astro-photostream': minor
---

Add layout wrapper integration for theme compatibility

This release introduces layout wrapper support, allowing the astro-photostream integration to seamlessly work with existing Astro themes and layouts.

**New Features:**

- Layout wrapper configuration in integration options
- Consuming projects can now provide their own layout components for photo routes
- Custom props can be passed to layout wrappers
- Content-only route templates that render within provided layouts
- Graceful fallback to minimal HTML structure when no layout is provided

**Configuration:**

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [
    photoStream({
      layout: {
        enabled: true,
        wrapper: './src/layouts/BaseLayout.astro',
        props: {
          author: 'Your Name',
          siteName: 'My Photo Blog',
        },
      },
    }),
  ],
});
```

Technical Implementation:

- Added layout configuration schema with Zod validation
- Created content-only route templates (.content.astro) alongside existing full HTML templates
- Conditional route injection based on layout configuration
- Layout wrapper utility functions for prop management and component loading
- Virtual imports for layout configuration access in route templates

Benefits:

- Photo routes inherit consuming project's theme, navigation, and styling
- Works with existing Astro themes like Cactus, Minimal, etc.
- Maintains backward compatibility - existing installations continue to work unchanged
- Type-safe configuration with proper TypeScript support

This change addresses the major limitation where photo routes appeared standalone without integrating with the consuming project's design system.
