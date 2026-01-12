
import { defineConfig } from 'vite';

export default defineConfig({
  // This must match your GitHub repository name
  base: '/AssignMate/',
  build: {
    // The directory where the build files will be placed
    outDir: 'dist',
    // Directory to nest generated assets under
    assetsDir: 'assets',
    // Ensure the build process is clean
    emptyOutDir: true,
  },
  server: {
    // Ensures local development works correctly with SPA routing
    historyApiFallback: true,
  }
});
