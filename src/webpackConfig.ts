import path from 'path';
import webpack, { Configuration } from 'webpack';
import babelConfig from './babel.config';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import StartServerWebpackPlugin from './plugins/start-server-webpack-plugin';
const outputFilename = 'main.js';
let config: Configuration = {
  context: process.cwd(),
  entry: ['webpack/hot/signal', path.resolve(process.cwd(), './src/index.ts')],
  devtool: 'source-map',
  mode: 'development',
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/signal'],
    }),
  ],
  // if webpack v5
  // externalsPresets:{
  //   node: true
  // },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelConfig,
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', 'json'],
    modules: [path.resolve(process.cwd(), 'src'), path.resolve(process.cwd(), 'node_modules')],
  },
  output: {
    filename: outputFilename,
    path: path.resolve(process.cwd(), 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
    // new webpack.BannerPlugin({
    //   banner: "#!/usr/bin/env node",
    //   raw: true,
    // }),
    new StartServerWebpackPlugin({
      name: outputFilename,
      signal: true,
      // nodeArgs: ['--inspect']
    }),
  ],
};

export default config;
