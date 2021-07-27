
"use strict";

const {
	ConcatSource,
	OriginalSource,
	PrefixSource,
	RawSource
} = require("webpack-sources");
const {
	Tapable,
	SyncWaterfallHook,
	SyncHook,
	SyncBailHook
} = require("tapable");
const Template = require("./Template");

module.exports = class MainTemplate extends Tapable {
  constructor(outputOptions) {
    super();
    this.outputOptions = outputOptions || {};
    this.hooks = {
			renderManifest: new SyncWaterfallHook(["result", "options"]),
			modules: new SyncWaterfallHook([
				"modules",
				"chunk",
				"hash",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			moduleObj: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"moduleIdExpression"
			]),
			requireEnsure: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"chunkIdExpression"
			]),
			bootstrap: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			localVars: new SyncWaterfallHook(["source", "chunk", "hash"]),
			require: new SyncWaterfallHook(["source", "chunk", "hash"]),
			requireExtensions: new SyncWaterfallHook(["source", "chunk", "hash"]),
			beforeStartup: new SyncWaterfallHook(["source", "chunk", "hash"]),
			startup: new SyncWaterfallHook(["source", "chunk", "hash"]),
			afterStartup: new SyncWaterfallHook(["source", "chunk", "hash"]),
      render: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			renderWithEntry: new SyncWaterfallHook(["source", "chunk", "hash"]),
			moduleRequire: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"moduleIdExpression"
			]),
			addModule: new SyncWaterfallHook([
				"source",
				"chunk",
				"hash",
				"moduleIdExpression",
				"moduleExpression"
			]),
			currentHash: new SyncWaterfallHook(["source", "requestedLength"]),
			assetPath: new SyncWaterfallHook(["path", "options", "assetInfo"]),
			hash: new SyncHook(["hash"]),
			hashForChunk: new SyncHook(["hash", "chunk"]),
			globalHashPaths: new SyncWaterfallHook(["paths"]),
			globalHash: new SyncBailHook(["chunk", "paths"]),
			hotBootstrap: new SyncWaterfallHook(["source", "chunk", "hash"])
    }
    // 注入hook - MainTemplate
    this.hooks.startup.tap("MainTemplate", (source, chunk, hash) => {
      // TODO
    });
    // 注入hook - MainTemplate
		this.hooks.render.tap(
			"MainTemplate",
			(bootstrapSource, chunk, hash, moduleTemplate, dependencyTemplates) => {
        // TODO
			}
		);
    // 注入hook - MainTemplate
		this.hooks.localVars.tap("MainTemplate", (source, chunk, hash) => {
      // TODO
		});
    // 注入hook - MainTemplate
		this.hooks.require.tap("MainTemplate", (source, chunk, hash) => {
			// TODO
		});
    // 注入hook - MainTemplate
		this.hooks.moduleObj.tap(
			"MainTemplate",
			(source, chunk, hash, varModuleId) => {
        // TODO
			}
		);
    // 注入hook - MainTemplate
		this.hooks.requireExtensions.tap("MainTemplate", (source, chunk, hash) => {
			// TODO
		});
    
		this.requireFn = "__webpack_require__";
  }

	
	// 获取静态资源路径
	getAssetPath(path, options) {
		return this.hooks.assetPath.call(path, options);
	}
}