

"use strict";

const path = require("path");

const OptionsDefaulter = require("./OptionsDefaulter");
const Template = require("./Template");

class WebpackOptionsDefaulter extends OptionsDefaulter {
  constructor() {
    super();

    // 默认入口src
    this.set("entry", "./src");

    // 设置开发者工具
    // e.g. this = { config: { devtool: 'make', defaults: { entry: './src', devtool: () => {} } }}
    this.set("devtool", "make", options => {
      options.mode === "development" ? "eval" : false;
    });

    this.set("cache", "make", options => options.mode === "development");

		this.set("context", process.cwd());
		this.set("target", "web");

    
		this.set("module", "call", value => Object.assign({}, value));
		this.set("module.unknownContextRequest", ".");
		this.set("module.unknownContextRegExp", false);
		this.set("module.unknownContextRecursive", true);
		this.set("module.unknownContextCritical", true);
		this.set("module.exprContextRequest", ".");
		this.set("module.exprContextRegExp", false);
		this.set("module.exprContextRecursive", true);
		this.set("module.exprContextCritical", true);
		this.set("module.wrappedContextRegExp", /.*/);
		this.set("module.wrappedContextRecursive", true);
		this.set("module.wrappedContextCritical", false);
		this.set("module.strictExportPresence", false);
		this.set("module.strictThisContextOnImports", false);
		this.set("module.unsafeCache", "make", options => !!options.cache);
		this.set("module.rules", []);
    this.set("module.defaultRules", "make", options => [
      // TODO
    ]);

    this.set("output", "call", (value, options) => {
      // TODO
    });
    this.set("output.filename", "[name].js");
    this.set("output.chunkFilename", "make", options => {
      // TODO
    });
    this.set("output.webassemblyModuleFilename", "[modulehash].module.wasm");
    this.set("output.library", "");
		this.set("output.hotUpdateFunction", "make", options => {
			// TODO
		});
		this.set("output.jsonpFunction", "make", options => {
			// TODO
		});
		this.set("output.chunkCallbackName", "make", options => {
			// TODO
		});
		this.set("output.globalObject", "make", options => {
			// TODO
		});
		this.set("output.devtoolNamespace", "make", options => {
			// TODO
		});
		this.set("output.libraryTarget", "var");
		this.set("output.path", path.join(process.cwd(), "dist"));
		this.set(
			"output.pathinfo",
			"make",
			options => options.mode === "development"
		);
		this.set("output.sourceMapFilename", "[file].map[query]");
		this.set("output.hotUpdateChunkFilename", "[id].[hash].hot-update.js");
		this.set("output.hotUpdateMainFilename", "[hash].hot-update.json");
		this.set("output.crossOriginLoading", false);
		this.set("output.jsonpScriptType", false);
		this.set("output.chunkLoadTimeout", 120000);
		this.set("output.hashFunction", "md4");
		this.set("output.hashDigest", "hex");
		this.set("output.hashDigestLength", 20);
		this.set("output.devtoolLineToLine", false);
		this.set("output.strictModuleExceptionHandling", false);
		this.set("node", "call", value => {
			// TODO
		});
		this.set("node.console", false);
		this.set("node.process", true);
		this.set("node.global", true);
		this.set("node.Buffer", true);
		this.set("node.setImmediate", true);
		this.set("node.__filename", "mock");
		this.set("node.__dirname", "mock");

		this.set("performance", "call", (value, options) => {
			// TODO
		});
		this.set("performance.maxAssetSize", 250000);
		this.set("performance.maxEntrypointSize", 250000);
		this.set("performance.hints", "make", options =>
      isProductionLikeMode(options) ? "warning" : false
		);

		this.set("optimization", "call", value => Object.assign({}, value));
		this.set(
			"optimization.removeAvailableModules",
			"make",
			options => options.mode !== "development"
		);
		this.set("optimization.removeEmptyChunks", true);
		this.set("optimization.mergeDuplicateChunks", true);
		this.set("optimization.flagIncludedChunks", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.occurrenceOrder", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.sideEffects", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.providedExports", true);
		this.set("optimization.usedExports", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.concatenateModules", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.splitChunks", {});
		this.set("optimization.splitChunks.hidePathInfo", "make", options => {
			return isProductionLikeMode(options);
		});
		this.set("optimization.splitChunks.chunks", "async");
		this.set("optimization.splitChunks.minSize", "make", options => {
			return isProductionLikeMode(options) ? 30000 : 10000;
		});
		this.set("optimization.splitChunks.minChunks", 1);
		this.set("optimization.splitChunks.maxAsyncRequests", "make", options => {
			return isProductionLikeMode(options) ? 5 : Infinity;
		});
		this.set("optimization.splitChunks.automaticNameDelimiter", "~");
		this.set("optimization.splitChunks.automaticNameMaxLength", 109);
		this.set("optimization.splitChunks.maxInitialRequests", "make", options => {
			return isProductionLikeMode(options) ? 3 : Infinity;
		});
		this.set("optimization.splitChunks.name", true);
		this.set("optimization.splitChunks.cacheGroups", {});
		this.set("optimization.splitChunks.cacheGroups.default", {
			automaticNamePrefix: "",
			reuseExistingChunk: true,
			minChunks: 2,
			priority: -20
		});
		this.set("optimization.splitChunks.cacheGroups.vendors", {
			automaticNamePrefix: "vendors",
			test: /[\\/]node_modules[\\/]/,
			priority: -10
		});
		this.set("optimization.runtimeChunk", "call", value => {
			if (value === "single") {
				return {
					name: "runtime"
				};
			}
			if (value === true || value === "multiple") {
				return {
					name: entrypoint => `runtime~${entrypoint.name}`
				};
			}
			return value;
		});
		this.set("optimization.noEmitOnErrors", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.checkWasmTypes", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.mangleWasmImports", false);
		// TODO webpack 5 remove optimization.namedModules
		this.set(
			"optimization.namedModules",
			"make",
			options => options.mode === "development"
		);
		this.set("optimization.hashedModuleIds", false);
		// TODO webpack 5 add `chunkIds: "named"` default for development
		// TODO webpack 5 add `chunkIds: "size"` default for production
		// TODO webpack 5 remove optimization.namedChunks
		this.set(
			"optimization.namedChunks",
			"make",
			options => options.mode === "development"
		);
		this.set(
			"optimization.portableRecords",
			"make",
			options =>
				!!(
					options.recordsInputPath ||
					options.recordsOutputPath ||
					options.recordsPath
				)
		);
		this.set("optimization.minimize", "make", options =>
			isProductionLikeMode(options)
		);
		this.set("optimization.minimizer", "make", options => [
			{
				apply: compiler => {
					// 延迟加载Terser插件（压缩Javascript包）
					const TerserPlugin = require("terser-webpack-plugin");
					const SourceMapDevToolPlugin = require("./SourceMapDevToolPlugin");
					new TerserPlugin({
						cache: true,
						parallel: true,
						sourceMap:
							(options.devtool && /source-?map/.test(options.devtool)) ||
							(options.plugins &&
								options.plugins.some(p => p instanceof SourceMapDevToolPlugin))
					}).apply(compiler);
				}
			}
		]);
		this.set("optimization.nodeEnv", "make", options => {
			// TODO: In webpack 5, it should return `false` when mode is `none`
			return options.mode || "production";
		});

		this.set("resolve", "call", value => Object.assign({}, value));
		this.set("resolve.unsafeCache", true);
		this.set("resolve.modules", ["node_modules"]);
		this.set("resolve.extensions", [".wasm", ".mjs", ".js", ".json"]);
		this.set("resolve.mainFiles", ["index"]);
		this.set("resolve.aliasFields", "make", options => {
			if (
				options.target === "web" ||
				options.target === "webworker" ||
				options.target === "electron-renderer"
			) {
				return ["browser"];
			} else {
				return [];
			}
		});
		this.set("resolve.mainFields", "make", options => {
			if (
				options.target === "web" ||
				options.target === "webworker" ||
				options.target === "electron-renderer"
			) {
				return ["browser", "module", "main"];
			} else {
				return ["module", "main"];
			}
		});
		this.set("resolve.cacheWithContext", "make", options => {
			return (
				Array.isArray(options.resolve.plugins) &&
				options.resolve.plugins.length > 0
			);
		});

		this.set("resolveLoader", "call", value => Object.assign({}, value));
		this.set("resolveLoader.unsafeCache", true);
		this.set("resolveLoader.mainFields", ["loader", "main"]);
		this.set("resolveLoader.extensions", [".js", ".json"]);
		this.set("resolveLoader.mainFiles", ["index"]);
		this.set("resolveLoader.roots", "make", options => [options.context]);
		this.set("resolveLoader.cacheWithContext", "make", options => {
			return (
				Array.isArray(options.resolveLoader.plugins) &&
				options.resolveLoader.plugins.length > 0
			);
		});

		this.set("infrastructureLogging", "call", value =>
			Object.assign({}, value)
		);
		this.set("infrastructureLogging.level", "info");
		this.set("infrastructureLogging.debug", false);
  }
}
module.exports = WebpackOptionsDefaulter;
