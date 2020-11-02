import webpack from 'webpack';
import webpackConfig from '../webpackConfig';
import shell from 'shelljs';
let compiler = webpack(webpackConfig);

shell.rm('-rf', 'dist');
// shell.exec('npx tsc');
shell.exec('npx babel src --out-dir dist --extensions .ts', (code) => {
  console.log(code);
  shell.exec(`sed -i '' -e '1i #!/usr/bin/env node' ${compiler.outputPath + '/index.js'}`);
});
