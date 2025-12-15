// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  vite: {
      plugins: [tailwindcss()],
	},

  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },

  integrations: [react()],
});
