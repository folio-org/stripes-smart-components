const path = require('path');
const config = require('@folio/jest-config-stripes').config;

module.exports = {
  ...config,
  setupFiles: [
    ...config.setupFiles,
    path.join(__dirname, './tests/jest/setupFiles.js'),
  ],
};
