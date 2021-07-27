/**
 * webpack options 应用
 */
"use strict";

const OptionsApply = require("./OptionsApply");

const JavascriptModulesPlugin = require("./JavascriptModulesPlugin");
const JsonModulesPlugin = require("./JsonModulesPlugin");
const WebAssemblyModulesPlugin = require("./wasm/WebAssemblyModulesPlugin");

const LoaderTargetPlugin = require("./LoaderTargetPlugin");
const FunctionModulePlugin = require("./FunctionModulePlugin");
const EvalDevToolModulePlugin = require("./EvalDevToolModulePlugin");
const SourceMapDevToolPlugin = require("./SourceMapDevToolPlugin");
const EvalSourceMapDevToolPlugin = require("./EvalSourceMapDevToolPlugin");

const EntryOptionPlugin = require("./EntryOptionPlugin");
const RecordIdsPlugin = require("./RecordIdsPlugin");

const APIPlugin = require("./APIPlugin");
const ConstPlugin = require("./ConstPlugin");
const CommonJsStuffPlugin = require("./CommonJsStuffPlugin");
const CompatibilityPlugin = require("./CompatibilityPlugin");

const TemplatedPathPlugin = require("./TemplatedPathPlugin");
const WarnCaseSensitiveModulesPlugin = require("./WarnCaseSensitiveModulesPlugin");
const UseStrictPlugin = require("./UseStrictPlugin");

const LoaderPlugin = require("./dependencies/LoaderPlugin");
const CommonJsPlugin = require("./dependencies/CommonJsPlugin");
const HarmonyModulesPlugin = require("./dependencies/HarmonyModulesPlugin");
const SystemPlugin = require("./dependencies/SystemPlugin");
const ImportPlugin = require("./dependencies/ImportPlugin");
const RequireContextPlugin = require("./dependencies/RequireContextPlugin");
const RequireEnsurePlugin = require("./dependencies/RequireEnsurePlugin");
const RequireIncludePlugin = require("./dependencies/RequireIncludePlugin");

const { cachedCleverMerge } = require("./util/cleverMerge");

class WebpackOptionsApply extends OptionsApply {
  constructor() {
    super();
  }

  // 处理options
  process(options, compiler) {
    let ExternalsPlugin;
    compiler.outputPath = options.output.path;
    compiler.recordsInputPath = options.recordesInputPath || options.recordsPath;
    compiler.recordsOutPath =
      options.recordsOutputPath || options.recordsPath;
    compiler.name = options.name;
    compiler.dependencies = options.dependencies;
    if (typeof options.target === "string") {
      // jsonp模板插件
      let JsonpTemplatePlugin;
      let FetchCompileWasmTemplatePlugin;
      let ReadFileCompileWasmTemplatePlugin;
      let NodeSourcePlugin;
      let NodeTargetPlugin;
      let NodeTemplatePlugin;

      switch (options.target) {
        case "web": 
          JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
          FetchCompileWasmTemplatePlugin = require("./web/FetchCompileWasmTemplatePlugin");
          NodeSourcePlugin = require("./node/NodeSourcePlugin");
          new JsonpTemplatePlugin().apply(compiler);
          new FetchCompileWasmTemplatePlugin({
            mangleImports: options.optimization.mangleWasmImports
          }).apply(compiler);
          new FunctionModulePlugin().apply(compiler);
          new NodeSourcePlugin(options.node).apply(compiler);
          new LoaderTargetPlugin(options.target).apply(compiler);
          break;
        // TODO
        default:
					throw new Error("Unsupported target '" + options.target + "'.");
      }
    } else if (options.target !== false) {
      // TODO
    } else {
			throw new Error("Unsupported target '" + options.target + "'.");
    }

    if (options.output.library || options.output.libraryTarget !== "var") {
      // TODO
    }
    if (options.externals) {
      // TODO
    }

    let noSources;
    let legacy;
    let modern;
    let comment;
    if (
      options.devtool &&
      (options.devtool.includes("sourcemap") ||
        options.devtool.includes("source-map"))
    ) {
      // TODO
    } else if (options.devtool && options.devtool.includes("eval")) {
      // TODO
    }

    new JavascriptModulesPlugin().apply(compiler);
    new JsonModulesPlugin().apply(compiler);
    new WebAssemblyModulesPlugin({
      mangleImports: options.optimization.mangleWasmImports
    }).apply(compiler);

    new EntryOptionPlugin().apply(compiler);
    // 触发入口参数插件hook
    compiler.hooks.entryOption.call(options.context, options.entry);
    // 兼容性插件
    new CompatibilityPlugin().apply(compiler);
    // 鸿蒙系统模块插件
    new HarmonyModulesPlugin(options.module).apply(compiler);
    if (options.amd !== false) {
      const AMDPlugin = require("./dependencies/AMDPlugin");
      const RequireJsStuffPlugin = require("./RequireJsStuffPlugin");
      new AMDPlugin(options.module, options.amd || {}).apply(compiler);
      new RequireJsStuffPlugin().apply(compiler);
    }
    new CommonJsPlugin(options.module).apply(compiler);
    new LoaderPlugin().apply(compiler);
    if (options.node !== false) {
      const NodeStuffPlugin = require("./NodeStuffPlugin");
      new NodeStuffPlugin(options.node).apply(compiler);
    }
    new CommonJsStuffPlugin().apply(compiler);
    new APIPlugin().apply(compiler);
    new ConstPlugin().apply(compiler);
    new UseStrictPlugin().apply(compiler);
    new RequireIncludePlugin().apply(compiler);
    new RequireEnsurePlugin().apply(compiler);
    new RequireContextPlugin(
      options.resolve.modules,
      options.resolve.extensions,
      options.resolve.mainFiles
    ).apply(compiler);
    new ImportPlugin(options.module).apply(compiler);
    new SystemPlugin(options.module).apply(compiler);

    if (typeof options.mode !== "string") {
      // TODO
    }

    const EnsureChunkConditionsPlugin = require("./optimize/EnsureChunkConditionsPlugin");
    new EnsureChunkConditionsPlugin().apply(compiler);
    if (options.optimization.removeAvailableModules) {
			const RemoveParentModulesPlugin = require("./optimize/RemoveParentModulesPlugin");
			new RemoveParentModulesPlugin().apply(compiler);
    }
		if (options.optimization.removeEmptyChunks) {
			const RemoveEmptyChunksPlugin = require("./optimize/RemoveEmptyChunksPlugin");
			new RemoveEmptyChunksPlugin().apply(compiler);
		}
		if (options.optimization.mergeDuplicateChunks) {
			const MergeDuplicateChunksPlugin = require("./optimize/MergeDuplicateChunksPlugin");
			new MergeDuplicateChunksPlugin().apply(compiler);
		}
		if (options.optimization.flagIncludedChunks) {
			const FlagIncludedChunksPlugin = require("./optimize/FlagIncludedChunksPlugin");
			new FlagIncludedChunksPlugin().apply(compiler);
		}
		if (options.optimization.sideEffects) {
			const SideEffectsFlagPlugin = require("./optimize/SideEffectsFlagPlugin");
			new SideEffectsFlagPlugin().apply(compiler);
		}
		if (options.optimization.providedExports) {
			const FlagDependencyExportsPlugin = require("./FlagDependencyExportsPlugin");
			new FlagDependencyExportsPlugin().apply(compiler);
		}
		if (options.optimization.usedExports) {
			const FlagDependencyUsagePlugin = require("./FlagDependencyUsagePlugin");
			new FlagDependencyUsagePlugin().apply(compiler);
		}
		if (options.optimization.concatenateModules) {
			const ModuleConcatenationPlugin = require("./optimize/ModuleConcatenationPlugin");
			new ModuleConcatenationPlugin().apply(compiler);
		}
		if (options.optimization.splitChunks) {
			const SplitChunksPlugin = require("./optimize/SplitChunksPlugin");
			new SplitChunksPlugin(options.optimization.splitChunks).apply(compiler);
		}
    if (options.optimization.runtimeChunk) {
      // TODO
    }
		if (options.optimization.noEmitOnErrors) {
			const NoEmitOnErrorsPlugin = require("./NoEmitOnErrorsPlugin");
			new NoEmitOnErrorsPlugin().apply(compiler);
		}
		if (options.optimization.checkWasmTypes) {
			const WasmFinalizeExportsPlugin = require("./wasm/WasmFinalizeExportsPlugin");
			new WasmFinalizeExportsPlugin().apply(compiler);
		}
    let moduleIds = options.optimization.moduleIds;
    if (moduleIds === undefined) {
      if (options.optimization.occurrentceOrder) {
        moduleIds = "size";
      }
      if (options.optimization.namedModules) {
        // TODO
      }
      if (options.optimization.hashedModuleIds) {
        // TODO
      }
      if (moduleIds === undefined) {
        moduleIds = "natural";
      }
    }
    if (moduleIds) {
			const NamedModulesPlugin = require("./NamedModulesPlugin");
			const HashedModuleIdsPlugin = require("./HashedModuleIdsPlugin");
			const OccurrenceModuleOrderPlugin = require("./optimize/OccurrenceModuleOrderPlugin");
      switch (moduleIds) {
        case "natural":
          break;
        case "named":
          // TODO
          break;
        case "hashed":
          // TODO
          break;
        case "size":
					new OccurrenceModuleOrderPlugin({
						prioritiseInitial: true
					}).apply(compiler);
          break;
        case "total-size":
          // TODO
          break;
        default:
          throw new Error(
            `webpack bug: moduleIds: ${moduleIds} is not implemented`
          );
      }
    }
    let chunkIds = options.optimization.chunkIds;
    if (chunkIds === undefined) {
      if (options.optimization.occurrentceOrder) {
        chunkIds = "total-size";
      }
      if (options.optimization.namedChunks) {
        // TODO
      }
      if (chunkIds === undefined) {
        chunkIds = "natural";
      }
    }
    if (chunkIds) {
			const NaturalChunkOrderPlugin = require("./optimize/NaturalChunkOrderPlugin");
			const NamedChunksPlugin = require("./NamedChunksPlugin");
			const OccurrenceChunkOrderPlugin = require("./optimize/OccurrenceChunkOrderPlugin");
			switch (chunkIds) {
				case "natural":
          // TODO
          break;
        case "named":
          // TODO
          break;
        case "size":
          // TODO
          break;
        case "total-size":
					new OccurrenceChunkOrderPlugin({
						prioritiseInitial: false
					}).apply(compiler);
					break;
				default:
					throw new Error(
						`webpack bug: chunkIds: ${chunkIds} is not implemented`
					);
      }
    }
    if (options.optimization.nodeEnv) {
			const DefinePlugin = require("./DefinePlugin");
			new DefinePlugin({
				"process.env.NODE_ENV": JSON.stringify(options.optimization.nodeEnv)
			}).apply(compiler);
    }
		if (options.optimization.minimize) {
      // 压缩工具
			for (const minimizer of options.optimization.minimizer) {
				if (typeof minimizer === "function") {
					minimizer.call(compiler, compiler);
				} else {
					minimizer.apply(compiler);
				}
			}
		}

    // 性能插件
    if (options.performance) {
			const SizeLimitsPlugin = require("./performance/SizeLimitsPlugin");
			new SizeLimitsPlugin(options.performance).apply(compiler);
    }
		new TemplatedPathPlugin().apply(compiler);
    
		new RecordIdsPlugin({
			portableIds: options.optimization.portableRecords
		}).apply(compiler);

		new WarnCaseSensitiveModulesPlugin().apply(compiler);

    if (options.cache) {
      // TODO
    }

    // 触发afterPlugins - hook
    compiler.hooks.afterPlugins.call(compiler);
		if (!compiler.inputFileSystem) {
			throw new Error("No input filesystem provided");
		}
    // 注入hook - WebpackOptionsApply
    // 类型为normal
    compiler.resolveFactory.hooks.resolveOptions
      .for("normal")
      .tap("WebpackOptionsApply", resolveOptions => {
				return Object.assign(
					{
						fileSystem: compiler.inputFileSystem
					},
					cachedCleverMerge(options.resolve, resolveOptions)
				);
      });
    compiler.resolveFactory.hooks.resolveOptions
      .for("context")
      .tap("WebpackOptionsApply", resolveOptions => {
        // TODO
      });
    // 注入hook - WebpackOptionsApply
    // 类型为loader
    compiler.resolveFactory.hooks.resolveOptions
      .for("loader")
      .tap("WebpackOptionsApply", resolveOptions => {
				return Object.assign(
					{
						fileSystem: compiler.inputFileSystem
					},
					cachedCleverMerge(options.resolveLoader, resolveOptions)
				);
      });
    // 触发afterResolvers - hook
    compiler.hooks.afterResolvers.call(compiler);
    return options;
  }
}
module.exports = WebpackOptionsApply;