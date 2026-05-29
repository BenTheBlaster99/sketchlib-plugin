import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/**
 * SketchUp HtmlDialog loads from file:// and is unreliable with ES modules and
 * relative asset paths. Inline JS + CSS into a single index.html so there is
 * exactly one file to ship and nothing to resolve.
 */
function sketchupHtmlDialog() {
  return {
    name: 'sketchup-html-dialog',
    closeBundle() {
      const distDir = path.resolve('dist')
      const htmlPath = path.join(distDir, 'index.html')
      const jsPath = path.join(distDir, 'assets', 'app.js')
      const cssPath = path.join(distDir, 'assets', 'app.css')

      let html = fs.readFileSync(htmlPath, 'utf8')
      const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : ''
      const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : ''

      // Remove the emitted external references.
      html = html
        .replace(/<script type="module"[^>]*><\/script>\s*/g, '')
        .replace(/<script[^>]*src="\.?\/?assets\/app\.js"[^>]*><\/script>\s*/g, '')
        .replace(/<link rel="stylesheet"[^>]*href="\.?\/?assets\/app\.css"[^>]*>\s*/g, '')

      if (css) {
        html = html.replace('</head>', `  <style>${css}</style>\n</head>`)
      }
      if (js) {
        // Escape any literal "</script" inside the bundle so it cannot close
        // the inline <script> tag early (would dump JS-as-HTML → SyntaxError).
        const safeJs = js.replace(/<\/script/gi, '<\\/script')
        html = html.replace('</body>', `  <script>${safeJs}</script>\n</body>`)
      }

      fs.writeFileSync(htmlPath, html)

      // Single-file output: drop the now-inlined assets folder.
      fs.rmSync(path.join(distDir, 'assets'), { recursive: true, force: true })
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
