import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	ssr: false,
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	runtimeConfig: {
		public: {
			apiBase: '', // пусто = тот же домен
		},
	},

	vite: {
		plugins: [tailwindcss()],
	},
	modules: ['vue3-carousel-nuxt', '@pinia/nuxt'],
})
