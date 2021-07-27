
"use strict";

const { Tapable, SyncWaterfallHook, SyncHook } = require("tapable");

module.exports = class ChunkTemplate extends Tapable {
	constructor(outputOptions) {
		super();
		this.outputOptions = outputOptions || {};
		this.hooks = {
			renderManifest: new SyncWaterfallHook(["result", "options"]),
			modules: new SyncWaterfallHook([
				"source",
				"chunk",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			render: new SyncWaterfallHook([
				"source",
				"chunk",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			renderWithEntry: new SyncWaterfallHook(["source", "chunk"]),
			hash: new SyncHook(["hash"]),
			hashForChunk: new SyncHook(["hash", "chunk"])
    }
  }
}