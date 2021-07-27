
"use strict";

const SortableSet = require("./util/SortableSet");
const compareLocations = require("./compareLocations");

class ChunkGroup {
	constructor(options) {
		if (typeof options === "string") {
			options = { name: options };
		} else if (!options) {
			options = { name: undefined };
		}
		this.groupDebugId = debugId++;
		this.options = options;
		this._children = new SortableSet(undefined, sortById);
		this._parents = new SortableSet(undefined, sortById);
		this._blocks = new SortableSet();
		this.chunks = [];
		this.origins = [];
		this._moduleIndices = new Map();
		this._moduleIndices2 = new Map();
	}

  // 添加源
  addOrigin(module, loc, request) {
    this.origins.push({
      module,
      loc,
      request
    });
  }
  // 添加chunk
	pushChunk(chunk) {
		const oldIdx = this.chunks.indexOf(chunk);
		if (oldIdx >= 0) {
			return false;
		}
		this.chunks.push(chunk);
		return true;
	}

	setModuleIndex(module, index) {
		this._moduleIndices.set(module, index);
	}

	// 获取模块的索引
  getModuleIndex(module) {
    return this._moduleIndices.get(module);
  }

	setModuleIndex2(module, index) {
		this._moduleIndices2.set(module, index);
	}
  
	getModuleIndex2(module) {
		return this._moduleIndices2.get(module);
	}

	sortItems() {
		this.origins.sort(sortOrigin);
		this._parents.sort();
		this._children.sort();
	}

	get childrenIterable() {
		return this._children;
	}

	get parentsIterable() {
		return this._parents;
	}

}