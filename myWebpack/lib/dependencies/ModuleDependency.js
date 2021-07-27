
"use strict";
const Dependency = require("../Dependency");

class ModuleDependency extends Dependency {
	constructor(request) {
		super();
		this.request = request;
		this.userRequest = request;
	}
	
	getResourceIdentifier() {
		return `module${this.request}`;
	}
}

module.exports = ModuleDependency;
