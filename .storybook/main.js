const path = require('path');
module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    '@storybook/addon-interactions'
  ],
  "framework": {
    "name": "@storybook/web-components-webpack5",
    "options": {}
  },
  webpackFinal: async (config) => {
    config.resolve.extensionAlias = config.resolve.extensionAlias
      ? { ...config.resolve.extensionAlias, ".js": [".js", ".ts"] }
      : { ".js": [".js", ".ts"] };
    return config;
  },
}