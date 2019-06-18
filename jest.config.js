module.exports = {
  transformIgnorePatterns: [
    '/node_modules/(?!@folio/stripes-components|@folio/stripes-core).+(js|jsx)$'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
