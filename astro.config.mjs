// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves the project site from /RoomLens, so every asset
// reference must go through import.meta.env.BASE_URL.
export default defineConfig({
  site: 'https://alejandro1011-r.github.io',
  base: '/RoomLens',
  trailingSlash: 'ignore',
  build: { assets: '_assets' },
});
