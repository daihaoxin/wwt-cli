const webpack = require('webpack');
const cluster = require('cluster');
const webpackConfig = require('../webpack.config');
const compiler = webpack(webpackConfig);
compiler.watch(
  {
    // [watchOptions](/configuration/watch/#watchoptions) 示例
    aggregateTimeout: 300,
    ignored: /node_modules/,
    poll: 1000,
  },
  (err, stats) => {
    console.log('HMR waiting...');
  },
);
