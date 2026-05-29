import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/** Copy shell.html into dist; Ruby injects app.js + app.css at runtime (no giant index.html). */
function sketchupDistFiles() {
  return {
    name: 'sketchup-dist-files',
    closeBundle() {
      const distDir = path.resolve('dist')
      fs.copyFileSync(path.resolve('shell.html'), path.join(distDir, 'shell.html'))
      // Remove legacy single-file output if present.
      const legacy = path.join(distDir, 'index.html')
      if (fs.existsSync(legacy)) fs.unlinkSync(legacy)
      fs.rmSync(path.join(distDir, 'assets'), { recursive: true, force: true })
    },
  }
}

export default defineConfig({
  plugins: [react(), sketchupDistFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'SketchLibApp',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
  base: './',
})
