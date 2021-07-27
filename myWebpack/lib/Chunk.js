
"use strict";

const util = require("util");
const SortableSet = require("./util/SortableSet");
const intersect = require("./util/SetHelpers").intersect;
const GraphHelpers = require("./GraphHelpers");
const Entrypoint = require("./Entrypoint");
let debugId = 1000;
const ERR_CHUNK_ENTRY = "Chunk.entry was removed. Use hasRuntime()";
const ERR_CHUNK_INITIAL =
	"Chunk.initial was removed. Use canBeInitial/isOnlyInitial()";

const sortModuleById = (a, b) => {
  if (a.id < b.id) return -1;
  if (b.id < a.id) return 1;
  return 0;
};

class Chunk {
  constructor(name) {
    this.id = null;
    this.ids = null;
    this.debugId = debugId++;
    this.name = name;
		this.preventIntegration = false;
		this.entryModule = undefined;
		this._modules = new SortableSet(undefined, sortByIdentifier);
		this.filenameTemplate = undefined;
		this._groups = new SortableSet(undefined, sortChunkGroupById);
		this.files = [];
		this.rendered = false;
		this.hash = undefined;
		this.contentHash = Object.create(null);
		this.renderedHash = undefined;
		this.chunkReason = undefined;
		this.extraAsync = false;
		this.removedModules = undefined;
  }

	// 获取modules的数量
	getNumberOfModules() {
		return this._modules.size;
	}

	addGroup(chunkGroup) {
		if (this._groups.has(chunkGroup)) return false;
		this._groups.add(chunkGroup);
		return true;
	}

  addModule(module) {
    if (!this._modules.has(module)) {
      this._modules.add(module);
      return true;
    }
    return false;
  }

  containsModule(module) {
    return this._modules.has(module);
  }
	sortModules(sortByFn) {
		this._modules.sortWith(sortByFn || sortModuleById);
	}
	sortItems() {
		this.sortModules();
	}

	// 是否可以初始化
	canBeInitial() {
		for (const chunkGroup of this._groups) {
			if (chunkGroup.isInitial()) return true;
		}
		return false;
	}

	// 判断modules是否为空
	isEmpty() {
		return this._modules.size === 0;
	}
}