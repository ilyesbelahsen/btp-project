const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const monorepoRoot = path.resolve(__dirname, "../..");

const config = getDefaultConfig(__dirname);

// Resolve packages hoisted to the monorepo root by PNPM without watching all files
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Exclude monorepo node_modules from file watching
config.resolver.blockList = [
  new RegExp(`${path.resolve(monorepoRoot, "node_modules")}/.+`),
];

module.exports = withNativeWind(config, { input: "./global.css" });
