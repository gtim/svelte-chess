import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
	],
	test: {
		globals: true,
		environment: 'jsdom',
		// workaround for vitest bug: https://github.com/vitest-dev/vitest/issues/2834
		alias: [ { find: /^svelte$/, replacement: 'svelte/internal' } ],
	},
})
