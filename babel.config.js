module.exports = {
  presets: [
    [
      '@babel/env',
      {
        // "modules": false,
        targets: {
          node: '10',
        },
        // corejs: 3,
        // useBuiltIns: "usage",
      },
    ],
    ['@babel/preset-typescript'],
  ],
};
