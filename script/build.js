const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const shell = require('shelljs');
let compiler = webpack(webpackConfig);

shell.rm('-rf', 'dist');
let code = shell.exec('npx tsc', (code) => {
  if (code === 0) {
    shell.exec('npx babel src --out-dir dist --extensions .ts');
    shell.exec(`sed -i -e '1i #!/usr/bin/env node' ${compiler.outputPath + '/index.js'}`);
  }
});
