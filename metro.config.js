const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix react-leaflet Circle.js module resolution bug
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['browser', 'require', 'import'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Add alias fix for react-leaflet components
config.resolver.alias = {
  ...config.resolver.alias,
  'react-leaflet': 'react-leaflet/dist/react-leaflet',
};

module.exports = withNativeWind(config, { input: './app/global.css' });
