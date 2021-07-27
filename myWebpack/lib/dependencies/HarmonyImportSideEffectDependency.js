
"use strict";
const HarmonyImportDependency = require("./HarmonyImportDependency");

class HarmonyImportSideEffectDependency extends HarmonyImportDependency {
	constructor(request, originModule, sourceOrder, parserScope) {
		super(request, originModule, sourceOrder, parserScope);
	}

	// 获取引用
	getReference() {
		if (this._module && this._module.factoryMeta.sideEffectFree) return null;

		return super.getReference();
	}

	get type() {
		return "harmony side effect evaluation";
	}
}

HarmonyImportSideEffectDependency.Template = class HarmonyImportSideEffectDependencyTemplate extends HarmonyImportDependency.Template {
	// TODO
};

module.exports = HarmonyImportSideEffectDependency;
