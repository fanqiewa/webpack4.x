"use strict";

const DependencyReference = require("./DependencyReference");
const ModuleDependency = require("./ModuleDependency");
const Template = require("../Template");

class HarmonyImportDependency extends ModuleDependency {
  constructor(request, originModule, sourceOrder, parserScope) {
    super(request);
    this.redirectedModule = undefined;
    this.originModule = originModule;
    this.sourceOrder = sourceOrder;
    this.parserScope = parserScope;
  }

  get _module() {
    return this.redirectedModule || this.module;
  }
  
	getReference() {
		if (!this._module) return null;
		return new DependencyReference(
			this._module,
			false,
			this.weak,
			this.sourceOrder
		);
	}
}
module.exports = HarmonyImportDependency;