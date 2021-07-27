/**
 * webpack
 */
"use strict";

const Compiler = require("./Compiler");
const MultiCompiler = require("./MultiCompiler");
const NodeEnvironmentPlugin = require("./node/NodeEnvironmentPlugin");
const WebpackOptionsApply = require("./WebpackOptionsApply");
const WebpackOptionsDefaulter = require("./WebpackOptionsDefaulter");
const validateSchema = require("./validateSchema");
const WebpackOptionsValidationError = require("./WebpackOptionsValidationError");
const webpackOptionsSchema = require("../schemas/WebpackOptions.json");
const RemovedPluginError = require("./RemovedPluginError");
const version = require("../package.json").version;

/**
 * webpack构造函数
 * @param {Object} options options
 * @param {Function} callback 回调函数
 */
const webpack = (options, callback) => {
  // webpack架构校验错误
  const webpackOptionsValidationErrors = validateSchema(
    webpackOptionsSchema,
    options
  );

  if (webpackOptionsValidationErrors.length) {
    // 有错误，抛出异常
    throw new WebpackOptionsValidationError(webwebpackOptionsValidationErrors);
  }

  let compiler;
  if (Array.isArray(options)) {
    // TODO
  } else if (typeof options === "object") {
    // 设置options默认值
    options = new WebpackOptionsDefaulter().process(options);

    // 编译器
    compiler = new Compiler(options.context);
    compiler.options = options;

    // 应用node环境的plugin
    new NodeEnvironmentPlugin({
      infrastructureLogging: options.infrastructureLogging
    }).apply(compiler);
    // 如果程序员传递了plugins，且为数组
    if (options.plugins && Array.isArray(options.plugins)) {
      for (const plugin of options.plugins) {
        if (typeof plugin === "function") {
          plugin.call(compiler, compiler);
        } else {
          plugin.apply(compiler);
        }
      }
    }
    // 触发enviornment的Tapable钩子
    compiler.hooks.environment.call();
    // 触发afterEnvironment的Tapable钩子
    compiler.hooks.afterEnvironment.call();
    // 设置webpack的options
    compiler.options = new WebpackOptionsApply().process(options, compiler);
  } else {
    throw new Error("Invalid argument: options");
  }

  // e.g. vue-service-cli
  if (callback) {
		if (typeof callback !== "function") {
			throw new Error("Invalid argument: callback");
		}
    if (options.watch === true ||
      (Array.isArray(options) && options.some(o => o.watch))) {
      // TODO
    }
    compiler.run(callback);
  }
  return compiler;
}

exports = module.exports = webpack;
exports.version = version;

// 导出webpack插件
const exportPlugins = (obj, mappings) => {
	for (const name of Object.keys(mappings)) {
		Object.defineProperty(obj, name, {
			configurable: false,
			enumerable: true,
			get: mappings[name]
		});
	}
};


exportPlugins(exports, {

  // 定义全局变量
	DefinePlugin: () => require("./DefinePlugin"),
})