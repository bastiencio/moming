import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console statements in production
        drop_debugger: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
          // Feature chunks
          'chunk-auth': ['src/contexts/AuthContext.tsx', 'src/pages/Auth.tsx'],
          'chunk-products': ['src/pages/Products.tsx', 'src/hooks/useProducts.ts'],
          'chunk-sales': ['src/pages/Sales.tsx', 'src/hooks/useSales.ts'],
          'chunk-invoices': ['src/pages/Invoices.tsx', 'src/hooks/useInvoices.ts'],
          'chunk-analytics': ['src/pages/Analytics.tsx', 'src/hooks/useSalesAnalytics.ts'],
        },
      },
    },
    // Source maps for production debugging
    sourcemap: 'hidden', // Generate source maps but don't reference them in production
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB limit
    // CSS code splitting
    cssCodeSplit: true,
  },
}));
