
"use strict";
const NullDependency = require("./NullDependency");

class HarmonyCompatibilityDependency extends NullDependency {
	constructor(originModule) {
		super();
		this.originModule = originModule;
	}
	
	get type() {
		return "harmony export header";
	}
}

HarmonyCompatibilityDependency.Template = class HarmonyExportDependencyTemplate {
	// TODO
};

module.exports = HarmonyCompatibilityDependency;
