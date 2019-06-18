module.exports = {
  presets: [
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    'transform-dynamic-import',
    '@babel/plugin-proposal-class-properties'
  ]
};
