// babel.config.js
module.exports = {
    "ignore": ["**/.#*"],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [ '@babel/plugin-proposal-class-properties' ],
};
