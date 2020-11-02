import webpack from 'webpack';
import webpackConfig from '../webpackConfig';
// const shell = require("shelljs");
let compiler = webpack(webpackConfig);
export default () => {
  compiler.watch(
    {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 1000,
    },
    (err, stats) => {
      console.log('HMR waiting...');
    },
  );
};
