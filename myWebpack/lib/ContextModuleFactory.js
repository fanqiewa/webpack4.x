
"use strict";

const asyncLib = require("neo-async");
const path = require("path");

const {
	Tapable,
	AsyncSeriesWaterfallHook,
	SyncWaterfallHook
} = require("tapable");
const ContextModule = require("./ContextModule");
const ContextElementDependency = require("./dependencies/ContextElementDependency");

module.exports = class ContextModuleFactory extends Tapable {
  constructor(resolverFactory) {
    super();
    this.hooks = {
			beforeResolve: new AsyncSeriesWaterfallHook(["data"]),
			afterResolve: new AsyncSeriesWaterfallHook(["data"]),
			contextModuleFiles: new SyncWaterfallHook(["files"]),
			alternatives: new AsyncSeriesWaterfallHook(["modules"])
    };
    // 注入hook - ContextModuleFactory
    this._pluginCompat.tap("ContextModuleFactory", options => {
      // TODO
    });
		this.resolverFactory = resolverFactory;
  }
}