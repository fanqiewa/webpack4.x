
"use strict";

const { Tapable, SyncWaterfallHook, SyncHook } = require("tapable");

module.exports = class ModuleTemplate extends Tapable {
	constructor(runtimeTemplate, type) {
		super();
		this.runtimeTemplate = runtimeTemplate;
		this.type = type;
		this.hooks = {
			content: new SyncWaterfallHook([
				"source",
				"module",
				"options",
				"dependencyTemplates"
			]),
			module: new SyncWaterfallHook([
				"source",
				"module",
				"options",
				"dependencyTemplates"
			]),
			render: new SyncWaterfallHook([
				"source",
				"module",
				"options",
				"dependencyTemplates"
			]),
			package: new SyncWaterfallHook([
				"source",
				"module",
				"options",
				"dependencyTemplates"
			]),
			hash: new SyncHook(["hash"])
		};
	}
}