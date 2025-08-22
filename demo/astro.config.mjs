import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
// import photoStream from "astro-photo-stream";

export default defineConfig({
  integrations: [tailwind()],
  // Note: astro-photo-stream integration is currently in development
  // The main package needs several fixes before it can be used
  // integrations: [tailwind(), photoStream({})],
});
