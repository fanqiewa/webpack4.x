/**
 * 简写使用DefinePlugin上process.env键
 */
"use strict";

const WebpackError = require("./WebpackError");
const DefinePlugin = require("./DefinePlugin");

const needsEnvVarFix =
	["8", "9"].indexOf(process.versions.node.split(".")[0]) >= 0 &&
	process.platform === "win32";

class EnvironmentPlugin {
  constructor(...keys) {
    if (keys.length === 1 && Array.isArray(keys[0])) {
      // e.g. keys = [['NODE_ENV', 'DEBUG']]
      /*
        等效于：
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
        });
      */
      this.keys = keys[0];
      this.defaultValues = {};
    } else if (keys.length === 1 && keys[0] && typeof keys[0] === "object") {
      // e.g. keys = [{ NODE_ENV: 'development', DEBUG: false }]
      this.keys = Object.keys(keys[0]);
      this.defaultValues = keys[0];
    } else {
      // e.g. keys = [ 'NODE_ENV' ]
      this.keys = keys;
      this.defaultValues = {};
    }
  }

  apply(compiler) {
    const definitions = this.keys.reduce((defs, key) => {

			if (needsEnvVarFix) require("os").cpus();

			const value =
				process.env[key] !== undefined
					? process.env[key]
          // 通过数组配置的EnvironmentPlugin，默认值被设置为空对象，将会设成报错
					: this.defaultValues[key];

			if (value === undefined) {
        // 环境变量未定义错误
				compiler.hooks.thisCompilation.tap("EnvironmentPlugin", compilation => {
					const error = new WebpackError(
						`EnvironmentPlugin - ${key} environment variable is undefined.\n\n` +
							"You can pass an object with default values to suppress this warning.\n" +
							"See https://webpack.js.org/plugins/environment-plugin for example."
					);

					error.name = "EnvVariableNotDefinedError";
					compilation.warnings.push(error);
				});
			}

			defs[`process.env.${key}`] =
				value === undefined ? "undefined" : JSON.stringify(value);

			  return defs;
    }, {});

    // 最终还是调用这个插件
		new DefinePlugin(definitions).apply(compiler);
  }
}

module.exports = EnvironmentPlugin;