import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    // Sans background, le padding de ces presets sort en blanc
    maskable: { sizes: [512], resizeOptions: { background: '#f5c518' } },
    apple: { sizes: [180], resizeOptions: { background: '#f5c518' } },
  },
  images: ['public/icon.svg'],
})
