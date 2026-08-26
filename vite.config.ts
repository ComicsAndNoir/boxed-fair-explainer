import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const DUMMY_GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'

/**
 * Injects the real GA4 Measurement ID into index.html's hardcoded gtag
 * snippet at build/dev time — the ID is only ever set as a real env var in
 * deployed environments (e.g. Render); locally it falls back to a dummy so
 * the snippet still has a syntactically valid ID to reference.
 */
function injectGaId(measurementId: string): Plugin {
  return {
    name: 'inject-ga-measurement-id',
    transformIndexHtml(html) {
      return html.replaceAll('__GA_MEASUREMENT_ID__', measurementId)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gaMeasurementId = env.VITE_GA_MEASUREMENT_ID || DUMMY_GA_MEASUREMENT_ID

  return {
    plugins: [react(), injectGaId(gaMeasurementId)],
  }
})
