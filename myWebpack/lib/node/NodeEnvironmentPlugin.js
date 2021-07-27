/**
 * node环境插件
 */
"use strict";

const NodeWatchFileSystem = require("./NodeWatchFileSystem");
const NodeOutputFileSystem = require("./NodeOutputFileSystem");
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");
const createConsoleLogger = require("../logging/createConsoleLogger");
const nodeConsole = require("./nodeConsole");

class NodeEnvironmentPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    // 编译器添加基础结构记录器
    compiler.infrastructureLogger = createConsoleLogger(
      Object.assign(
        {
          level: "info",
          debug: false,
          console: nodeConsole
        },
        this.options.infrastructureLogging
      )
    );
    // 编译器的文件输入流方法
    compiler.inputFileSytem = new CachedInputFileSystem(
      new NodeJsInputFileSystem(),
      60000
    );
    const inputFileSystem = compiler.inputFileSystem;
    // 编译器的文件输出流方法
    compiler.outputFileSystem = new NodeOutputFileSystem();
    // 编译器的监听流方法
    compiler.watchFileSystem = new NodeWatchFileSystem(
      compiler.inputFileSystem
    );
    // 添加NodeEnvironmentPlugin钩子到beforRun的hooks队列中
    compiler.hooks.beforeRun.tap("NodeEnvironmentPlugin", compiler => {
      if (compiler.inputFileSystem === inputFileSystem) inputFileSystem.purge();
    });
  }
}