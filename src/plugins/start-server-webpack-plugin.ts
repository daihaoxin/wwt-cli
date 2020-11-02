import cluster, { Worker } from 'cluster';
import webpack, { Compiler } from 'webpack';

interface OptionsInterface {
  signal: boolean;
  name?: string;
  keyboard?: boolean;
  restartable?: boolean;
  nodeArgs?: string[];
  args?: string[];
}
const defaultOptions: OptionsInterface = {
  signal: true,
  name: 'index.js',
  // Only listen on keyboard in development, so the server doesn't hang forever
  keyboard: false,
};
class StartServerPlugin {
  private options: OptionsInterface;

  private worker: cluster.Worker | undefined;
  private entryPoint: string | undefined;

  public constructor(config: OptionsInterface | string) {
    this.options = { ...defaultOptions };
    if (typeof config === 'string') {
      this.options.name = config;
    } else {
      this.options = {
        ...this.options,
        ...config,
      };
    }

    this.afterEmit = this.afterEmit.bind(this);
    this.apply = this.apply.bind(this);
    this.startServer = this.startServer.bind(this);

    if (this.options.restartable !== false) {
      this.enableRestarting();
    }
  }

  public apply(compiler: Compiler): void {
    // Use the Webpack 4 Hooks API when possible.
    if (compiler.hooks) {
      const plugin = { name: 'StartServerPlugin' };

      compiler.hooks.afterEmit.tapAsync(plugin, this.afterEmit);
    } else {
      compiler.plugin('after-emit', this.afterEmit);
    }
  }

  private enableRestarting() {
    if (this.options.keyboard) {
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (data: string) => {
        if (data.trim() === 'rs') {
          console.log('Restarting app...');
          if (this.worker) {
            process.kill(this.worker.process.pid);
            this._startServer((worker: Worker) => {
              this.worker = worker;
            });
          }
        }
      });
    }
  }

  private getExecArgv() {
    const { options } = this;
    const execArgv = (options.nodeArgs || []).concat(process.execArgv);
    return execArgv;
  }

  private _getArgs() {
    const { options } = this;
    const argv = options.args || [];
    return argv;
  }

  private _getInspectPort(execArgv: string[]): number | undefined {
    const inspectArg = execArgv.find((arg) => arg.includes('--inspect'));
    if (!inspectArg || !inspectArg.includes('=')) {
      return;
    }
    const hostPort = inspectArg.split('=')[1];
    const port = hostPort.includes(':') ? hostPort.split(':')[1] : hostPort;
    return Number.parseInt(port, 10);
  }

  private _getSignal(): string | undefined {
    const { signal } = this.options;
    // allow users to disable sending a signal by setting to `false`...
    if (signal) {
      return 'SIGUSR2';
    } else {
      return;
    }
  }

  private afterEmit(compilation: webpack.compilation.Compilation, callback: CallableFunction): void {
    if (this.worker?.isConnected()) {
      const signal = this._getSignal();
      if (signal) {
        process.kill(this.worker.process.pid, signal);
      }
      return callback();
    }

    this.startServer(compilation, callback);
  }

  private startServer(compilation: webpack.compilation.Compilation, callback: CallableFunction) {
    const { options } = this;
    let name;
    const names = Object.keys(compilation.assets);
    if (options.name) {
      name = options.name;
      if (!compilation.assets[name]) {
        console.error('Entry ' + name + ' not found. Try one of: ' + names.join(' '));
      }
    } else {
      name = names[0];
      if (names.length > 1) {
        console.log('More than one entry built, selected ' + name + '. All names: ' + names.join(' '));
      }
    }
    // const {existsAt} = compilation.assets[name];
    // this._entryPoint = existsAt;

    this.entryPoint = `${compilation.outputOptions.path}/${name}`;

    this._startServer((worker: Worker) => {
      this.worker = worker;
      callback();
    });
  }

  private _startServer(callback: CallableFunction) {
    const args = this._getArgs();
    const execArgv = this.getExecArgv();
    const inspectPort = this._getInspectPort(execArgv);

    const clusterOptions: cluster.ClusterSettings = {
      exec: this.entryPoint,
      execArgv,
      args,
    };

    if (inspectPort) {
      clusterOptions.inspectPort = inspectPort;
    }
    cluster.setupMaster(clusterOptions);

    cluster.on('online', (worker) => {
      callback(worker);
    });

    cluster.fork();
  }
}

export default StartServerPlugin;
