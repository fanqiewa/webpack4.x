
"use strict";

const util = require("util");

const DependenciesBlock = require("./DependenciesBlock");
const ModuleReason = require("./ModuleReason");
const SortableSet = require("./util/SortableSet");
const Template = require("./Template");

class Module extends DependenciesBlock {
	constructor(type, context = null) {
		super();
		this.type = type;
		this.context = context;

		this.debugId = debugId++;

		this.hash = undefined;
		this.renderedHash = undefined;

		this.resolveOptions = EMPTY_RESOLVE_OPTIONS;
		this.factoryMeta = {};

		this.warnings = [];
		this.errors = [];
		this.buildMeta = undefined;
		this.buildInfo = undefined;

		this.reasons = [];
		this._chunks = new SortableSet(undefined, sortById);

		this.id = null;
		this.index = null;
		this.index2 = null;
		this.depth = null;
		this.issuer = null;
		this.profile = undefined;
		this.prefetched = false;
		this.built = false;

		this.used = null;
		this.usedExports = null;
		this.optimizationBailout = [];

		this._rewriteChunkInReasons = undefined;

		this.useSourceMap = false;

		this._source = null;
	}

  // 添加原因
  addReason(module, dependency, explanation) {
    this.reasons.push(new ModuleReason(module, dependency, explanation));
  }
	addChunk(chunk) {
		if (this._chunks.has(chunk)) return false;
		this._chunks.add(chunk);
		return true;
	}
	sortItems(sortChunks) {
		super.sortItems();
		if (sortChunks) this._chunks.sort();
		this.reasons.sort((a, b) => {
			if (a.module === b.module) return 0;
			if (!a.module) return -1;
			if (!b.module) return 1;
			return sortById(a.module, b.module);
		});
		if (Array.isArray(this.usedExports)) {
			this.usedExports.sort();
		}
	}

	// 获取chunk列表
	get chunksIterable() {
		return this._chunks;
	}

	// 判断module是否为入口模块
	isEntryModule() {
		for (const chunk of this._chunks) {
			if (chunk.entryModule === this) return true;
		}
		return false;
	}
}