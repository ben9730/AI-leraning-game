const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to prefer 'react-native' and 'default' export conditions over 'import'.
// Zustand's ESM build (esm/middleware.mjs) uses import.meta.env which Metro
// doesn't transform and browsers reject in non-module scripts.
config.resolver.unstable_conditionNames = ['react-native', 'require', 'default'];

module.exports = config;
