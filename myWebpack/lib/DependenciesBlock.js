
"use strict";

class DependenciesBlock {
	constructor() {
		this.dependencies = [];
		this.blocks = [];
		this.variables = [];
	}

	sortItems() {
		for (const block of this.blocks) block.sortItems();
	}
}
module.exports = DependenciesBlock;