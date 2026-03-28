// workbox-build config for post-export manifest injection
// Usage: npx workbox-cli injectManifest workbox-config.js
// Run after: expo export --platform web
module.exports = {
  swSrc: './web/service-worker.js',
  swDest: './dist/service-worker.js',
  globDirectory: './dist',
  globPatterns: ['**/*.{js,css,html,json,png,svg,woff,woff2}'],
  // iOS 35MB working budget — cap individual files at 5MB
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};
