const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add extra extensions for your project
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
