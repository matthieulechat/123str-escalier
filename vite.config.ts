import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker'
import { qrcode } from 'vite-plugin-qrcode'

export default defineConfig({
  plugins: [react(), tailwindcss(), checker({ typescript: true }), qrcode()],
})
