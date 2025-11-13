/**
 * Bundle Analysis Script
 * Usage: npm run build:analyze
 * 
 * This script generates a visual report of your bundle size breakdown
 * helping identify what's taking up space in your production build.
 */

import { visualizer } from 'rollup-plugin-visualizer';

export const bundleAnalyzerPlugin = () => {
  return visualizer({
    filename: './dist/bundle-report.html',
    title: 'Moming Admin - Bundle Size Analysis',
    template: 'treemap',
    open: false,
    gzipSize: true,
    brotliSize: false,
  });
};

/**
 * To use this in vite.config.ts:
 * 
 * import { bundleAnalyzerPlugin } from './scripts/analyze-bundle.js';
 * 
 * export default defineConfig(({ mode }) => ({
 *   plugins: [
 *     mode === 'analyze' && bundleAnalyzerPlugin(),
 *   ].filter(Boolean),
 * }));
 */
