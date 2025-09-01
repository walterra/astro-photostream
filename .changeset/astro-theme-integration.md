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
