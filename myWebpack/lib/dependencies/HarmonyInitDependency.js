/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const NullDependency = require("./NullDependency");

class HarmonyInitDependency extends NullDependency {
	constructor(originModule) {
		super();
		this.originModule = originModule;
	}

	get type() {
		return "harmony init";
	}
}

module.exports = HarmonyInitDependency;

HarmonyInitDependency.Template = class HarmonyInitDependencyTemplate {
	// TODO
};
