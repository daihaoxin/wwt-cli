export default {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: '10',
        },
        corejs: 3,
        useBuiltIns: 'usage',
      },
    ],
    ['@babel/preset-typescript'],
  ],
};
