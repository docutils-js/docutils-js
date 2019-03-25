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
};
