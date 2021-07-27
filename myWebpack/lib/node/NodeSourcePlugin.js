/**
 * node资源插件
 */
"use strict";
// enhanced-resolve: 提供异步 require.resolve 函数。它是高度可配置的。
// webpack 使用 enhanced-resolve 进行路径解析。它的作用类似于一个异步的 require.resolve 方法，将 require / import 语句中引入的字符串，解析为引入文件的绝对路径。
// 在其官方文档中，将其描述为高度可配置，这得益于它完善的插件系统。事实上，enhanced-resolve 的所有内置功能都是通过插件实现的。
const AliasPlugin = require("enhanced-resolve/lib/AliasPlugin");
const ParserHelpers = require("../ParserHelpers");
// 用于浏览器内使用的node核心库。对象形式，
// e.g.
// {
//   assert: 'h:\\-----------------------------\\webpack\\webpack-demo\\node_modules\\assert\\assert.js',
//   buffer: 'h:\\-----------------------------\\webpack\\webpack-demo\\node_modules\\buffer\\index.js',
//   http: 'h:\\-----------------------------\\webpack\\webpack-demo\\node_modules\\stream-http\\index.js'
// }
const nodeLibsBrowser = require("node-libs-browser");

module.exports = class NodeSourcePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const options = this.options;

    if (options === false) {
      return;
    }

    // 根据路径获取模块
    const getPathToModule = (module, type) => {
      if (type === true || (type === undefined && nodeLibsBrowser)) {
        if (!nodeLibsBrowser[module]) {
					throw new Error(
						`No browser version for node.js core module ${module} available`
					);
				}
				return nodeLibsBrowser[module];
      } else if (type === "mock") {
        // TODO
      } else if (type === "empty") {
        // TODO
      } else {
        // TODO
      }
    }
    
    const addExpression = (parser, name, module, type, suffix) => {
      suffix = suffix || "";
      parser.hooks.expression.for(name).tap("NodeSourcePlugin", () => {
        // TODO
      })
    }

    // 注入hook - NodeSourcePlugin
    compiler.hooks.compilation.tap(
      "NodeSourcePlugin",
      (compilation, { normalModuleFactory }) => {
        const handler = (parser, parserOptions) => {
          if (parserOptions.node === false) return;

          let localOptions = options;
          if (parserOptions.node) {
            // TODO
          }
          if (localOptions.global) {
            parser.hooks.expression
              .for("global")
              .tap("NodeSourcePlugin", () => {
								const retrieveGlobalModule = ParserHelpers.requireFileAsExpression(
									parser.state.module.context,
									require.resolve("../../buildin/global")
								);
								return ParserHelpers.addParsedVariableToModule(
									parser,
									"global",
									retrieveGlobalModule
								);
              });
          }
          if (localOptions.process) {
            const process = localOptions.process;
            addExpression(praser, "process", "process", processType);
          }
          if (localOptions.console) {
            // TODO
          }
          const bufferType = localOptions.Buffer;
          if (bufferType) {
            addExpression(parser, "Buffer", "buffer", bufferType, ".Buffer");
          }
          if (localOptions.setImmediate) {
            const setImmediateType = localOptions.setImmediate;
            addExpression(
              parser,
              "setImmediate",
              "timers",
              setImemediateType,
              ".setImmediate"
            );
            addExpression(
              parser,
              "clearImmediate",
              "timers",
              setImmediateType,
              ".clearImmediate"
            );
          }
        };
				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("NodeSourcePlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("NodeSourcePlugin", handler);
      }
    )

    // 注入hook - NodeSourcePlugin
    compiler.hooks.afterResolvers.tap("NodeSourcePlugin", compiler => {
      for (const lib of Object.keys(nodeLibsBrowser)) {
        if (options[lib] !== false) {
          compiler.resolveFactory.hooks.resolver
            .for("normal")
            .tap("NodeSourcePlugin", resolver => {
              // 添加浏览器能使用的node核心库插件别名
              new AliasPlugin(
                "described-resolve",
                {
                  name: lib,
                  onlyModule: true,
                  alias: getPathToModule(lib, options[lib])
                },
                "resolve"
              ).apply(resolver);
            });
        }
      }
    })
  }
}