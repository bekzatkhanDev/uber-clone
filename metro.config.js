const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix react-leaflet Circle.js module resolution bug
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['browser', 'require', 'import'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Ensure leaflet is treated as an external dependency for web
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  leaflet: require.resolve('leaflet'),
};

module.exports = withNativeWind(config, { input: './app/global.css' });
