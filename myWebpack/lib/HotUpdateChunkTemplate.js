
"use strict";

const Template = require("./Template");
const HotUpdateChunk = require("./HotUpdateChunk");
const { Tapable, SyncWaterfallHook, SyncHook } = require("tapable");

module.exports = class HotUpdateChunkTemplate extends Tapable {
	constructor(outputOptions) {
		super();
		this.outputOptions = outputOptions || {};
		this.hooks = {
			modules: new SyncWaterfallHook([
				"source",
				"modules",
				"removedModules",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			render: new SyncWaterfallHook([
				"source",
				"modules",
				"removedModules",
				"hash",
				"id",
				"moduleTemplate",
				"dependencyTemplates"
			]),
			hash: new SyncHook(["hash"])
		};
	}
}