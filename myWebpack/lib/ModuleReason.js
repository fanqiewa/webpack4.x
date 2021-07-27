
"use strict";

class ModuleReason {
	constructor(module, dependency, explanation) {
		this.module = module;
		this.dependency = dependency;
		this.explanation = explanation;
		this._chunks = null;
	}

	hasChunk(chunk) {
    // TODO
	}

	rewriteChunks(oldChunk, newChunks) {
    // TODO
	}
}

module.exports = ModuleReason;
