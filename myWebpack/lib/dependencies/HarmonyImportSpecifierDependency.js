
"use strict";

const DependencyReference = require("./DependencyReference");
const HarmonyImportDependency = require("./HarmonyImportDependency");
const HarmonyLinkingError = require("../HarmonyLinkingError");

class HarmonyImportSpecifierDependency extends HarmonyImportDependency {
	constructor(
		request,
		originModule,
		sourceOrder,
		parserScope,
		id,
		name,
		range,
		strictExportPresence
	) {
		super(request, originModule, sourceOrder, parserScope);
		this.id = id === null ? null : `${id}`;
		this.redirectedId = undefined;
		this.name = name;
		this.range = range;
		this.strictExportPresence = strictExportPresence;
		this.namespaceObjectAsContext = false;
		this.callArgs = undefined;
		this.call = undefined;
		this.directImport = undefined;
		this.shorthand = undefined;
	}


	getWarnings() {
		if (
			this.strictExportPresence ||
			this.originModule.buildMeta.strictHarmonyModule
		) {
			return [];
		}
		return this._getErrors();
	}
	
	// 获取引用
	getReference() {
		if (!this._module) return null;
		return new DependencyReference(
			this._module,
			this._id && !this.namespaceObjectAsContext ? [this._id] : true,
			false,
			this.sourceOrder
		);
	}

	getErrors() {
		if (
			this.strictExportPresence ||
			this.originModule.buildMeta.strictHarmonyModule
		) {
			return this._getErrors();
		}
		return [];
	}

	_getErrors() {
		const importedModule = this._module;
		if (!importedModule) {
			return;
		}

		if (!importedModule.buildMeta || !importedModule.buildMeta.exportsType) {
			if (
				this.originModule.buildMeta.strictHarmonyModule &&
				this._id &&
				this._id !== "default"
			) {
				return [
					new HarmonyLinkingError(
						`Can't import the named export '${this._id}' from non EcmaScript module (only default export is available)`
					)
				];
			}
			return;
		}
	}
	
	getNumberOfIdOccurrences() {
		return 0;
	}
}

HarmonyImportSpecifierDependency.Template = class HarmonyImportSpecifierDependencyTemplate extends HarmonyImportDependency.Template {
	// TODO
};

module.exports = HarmonyImportSpecifierDependency;
