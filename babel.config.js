// babel.config.js
module.exports = {
    "ignore": ["**/.#*"],
    presets: [
        ['@babel/typescript'],
    [
        '@babel/env',
      {
        targets: {
          node: '10',
        },
      },
    ],
  ],
    plugins: [ '@babel/plugin-proposal-class-properties',
             '@babel/plugin-proposal-object-rest-spread'],
};
