// babel.config.js
module.exports = {
    "ignore": ["**/.#*"],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '10',
        },
      },
    ],
  ],
  plugins: [ '@babel/plugin-proposal-class-properties' ],
};
