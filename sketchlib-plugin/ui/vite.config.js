import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/** SketchUp HtmlDialog loads file:// — ES modules often fail → white screen. */
function sketchupHtmlDialog() {
  return {
    name: 'sketchup-html-dialog',
    closeBundle() {
      const htmlPath = path.resolve('dist/index.html')
      let html = fs.readFileSync(htmlPath, 'utf8')
      // Strip type="module" (SketchUp file:// can't run modules) but keep
      // `defer` so the script still runs AFTER #root exists in the DOM.
      html = html
        .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/, '<script defer src="$1"></script>')
        .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/, '<link rel="stylesheet" href="$1">')
      fs.writeFileSync(htmlPath, html)
    },
  }
}

export default defineConfig({
  plugins: [react(), sketchupHtmlDialog()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'SketchLibApp',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/app.js',
        assetFileNames: 'assets/app.[ext]',
      },
    },
  },
  base: './',
})
