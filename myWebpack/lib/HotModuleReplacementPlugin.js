/**
 * 启用热模块更换，也称为HMR。
 */
"use strict";

const { SyncBailHook } = require("tapable");
const { RawSource } = require("webpack-sources");
const Template = require("./Template");
const ModuleHotAcceptDependency = require("./dependencies/ModuleHotAcceptDependency");
const ModuleHotDeclineDependency = require("./dependencies/ModuleHotDeclineDependency");
const ConstDependency = require("./dependencies/ConstDependency");
const NullFactory = require("./NullFactory");
const ParserHelpers = require("./ParserHelpers");

/*
  e.g. 
  new webpack.HotModuleReplacementPlugin({
    // Options...
  })
*/
module.exports = class HotModuleReplacementPlugin {
  constructor(options) {
    this.options = options || {};
    // 类型： (boolean) 设置为 true 时，插件会分成两步构建文件。首先编译热加载 chunks，之后再编译剩余的通常的资源。
    this.multiStep = this.options.multiStep;
    // 类型：(number) 当 multiStep 启用时，表示两步构建之间的延时。
    this.fullBuildTimeout = this.options.fullBuildTimeout || 200;
    // 类型：(number) 下载 manifest 的延时（webpack 3.0.0 后的版本支持）。
    this.requestTimeout = this.options.requestTimeout || 10000;
  }

  apply(compiler) {
		const multiStep = this.multiStep;
		const fullBuildTimeout = this.fullBuildTimeout;
		const requestTimeout = this.requestTimeout;
		const hotUpdateChunkFilename =
			compiler.options.output.hotUpdateChunkFilename;
		const hotUpdateMainFilename = compiler.options.output.hotUpdateMainFilename;
    // 添加hook - additionalPass
    compiler.hooks.additionalPass.tapAsync(
			"HotModuleReplacementPlugin",
			callback => {
				if (multiStep) return setTimeout(callback, fullBuildTimeout);
				return callback();
			}
		);

    const addParserPlugins = (parser, parserOptions) => {
      // TODO
    }

    compiler.hooks.compilation.tap(
      "HotModuleReplacementPlugin",
      (compilation, { normalModuleFactory }) => {
        // 这只会将HMR插件应用于目标编译器它不应该影响子编译
				if (compilation.compiler !== compiler) return;

        const hotUpdateChunkTemplate = compilation.hotUpdateChunkTemplate;
        if (!hotUpdateChunkTemplate) return;

				compilation.dependencyFactories.set(ConstDependency, new NullFactory());
        compilation.dependencyTemplates.set(
					ConstDependency,
					new ConstDependency.Template()
				);
        
				compilation.dependencyFactories.set(
					ModuleHotAcceptDependency,
					normalModuleFactory
				);
				compilation.dependencyTemplates.set(
					ModuleHotAcceptDependency,
					new ModuleHotAcceptDependency.Template()
				);

				compilation.dependencyFactories.set(
					ModuleHotDeclineDependency,
					normalModuleFactory
				);
				compilation.dependencyTemplates.set(
					ModuleHotDeclineDependency,
					new ModuleHotDeclineDependency.Template()
				);

        compilation.hooks.record.tap(
          "HotModuleReplacementPlugin",
          (compilation, records) => {
            // TODO
          }
        );
        let initialPass = false;
        let recompilation = false;
        compilation.hooks.afterHash.tap("HotModuleReplacementPlugin", () => {
          // TODO
        });
        compilation.hooks.shouldGenerateChunkAssets.tap(
          "HotModuleReplacementPlugin",
          () => {
            // TODO
          }
        );
        compilation.hooks.needAdditionalPass.tap(
          "HotModuleReplacementPlugin",
          () => {
            // TODO
          }
        );
        compilation.hooks.additionalChunkAssets.tap(
          "HotModuleReplacementPlugin",
          () => {
            // TODO
          }
        );

        const mainTemplate = compilation.mainTemplate;

        mainTemplate.hooks.hash.tap("HotModuleReplacementPlugin", hash => {
          // TODO
        });

        mainTemplate.hooks.moduleRequire.tap(
          "HotModuleReplacementPlugin",
          (_, chunk, hash, varModuleId) => {
            // TODO
          }
        );

        mainTemplate.hooks.requireExtensions.tap(
          "HotModuleReplacementPlugin",
          source => {
            // TODO
          }
        );

        const needChunkLoadingCode = chunk => {
          // TODO
        };

        mainTemplate.hooks.bootstrap.tap(
          "HotModuleReplacementPlugin",
          (source, chunk, hash) => {
            // TODO
          }
        );
        
				mainTemplate.hooks.globalHash.tap(
					"HotModuleReplacementPlugin",
					() => true
				);

				mainTemplate.hooks.currentHash.tap(
					"HotModuleReplacementPlugin",
					(_, length) => {
            // TODO
					}
				);

				mainTemplate.hooks.moduleObj.tap(
					"HotModuleReplacementPlugin",
					(source, chunk, hash, varModuleId) => {
						// TODO
					}
				);
        
				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("HotModuleReplacementPlugin", addParserPlugins);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("HotModuleReplacementPlugin", addParserPlugins);

				compilation.hooks.normalModuleLoader.tap(
					"HotModuleReplacementPlugin",
					context => {
						context.hot = true;
					}
				);
      }
    )
  }
};

