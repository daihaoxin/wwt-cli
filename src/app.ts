import { Command } from 'commander';
import shell from 'shelljs';
import path from 'path';
import start from './script/start';
const program = new Command();
program.version('0.0.1');
program.name('wwt').usage('[options] command');
program
  .command('dev')
  .description('启动开发模式')
  .action((option) => {
    // shell.exec('node ./script/start.ts');
    // console.log(process.cwd());
    // console.log(__dirname);
    start();
  });
program
  .command('build')
  .description('启动生产编译模式')
  .action((option) => {
    shell.exec('node ' + path.resolve(__dirname, './script/build.js'));
  });
program.parse(process.argv);
// console.log(program);
// if (program.debug) console.log(program.opts());
// console.log('pizza details:');
// if (program.small) console.log('- small pizza size');
// if (program.pizzaType) console.log(`- ${program.pizzaType}`);
