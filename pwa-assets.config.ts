import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    // Sans background, le padding de ces presets sort en blanc
    maskable: { sizes: [512], resizeOptions: { background: '#1f4fa8' } },
    apple: { sizes: [180], resizeOptions: { background: '#1f4fa8' } },
  },
  images: ['public/icon.svg'],
})
