
"use strict";

const HarmonyExportExpressionDependency = require("./HarmonyExportExpressionDependency");
const HarmonyImportSideEffectDependency = require("./HarmonyImportSideEffectDependency");
const HarmonyExportHeaderDependency = require("./HarmonyExportHeaderDependency");
const HarmonyExportSpecifierDependency = require("./HarmonyExportSpecifierDependency");
const HarmonyExportImportedSpecifierDependency = require("./HarmonyExportImportedSpecifierDependency");
const ConstDependency = require("./ConstDependency");

module.exports = class HarmonyExportDependencyParserPlugin {
	constructor(moduleOptions) {
		this.strictExportPresence = moduleOptions.strictExportPresence;
	}

	apply(parser) {
		parser.hooks.export.tap(
			"HarmonyExportDependencyParserPlugin",
			statement => {
        // TODO
			}
		);
		parser.hooks.exportImport.tap(
			"HarmonyExportDependencyParserPlugin",
			(statement, source) => {
        // TODO
			}
		);
		parser.hooks.exportExpression.tap(
			"HarmonyExportDependencyParserPlugin",
			(statement, expr) => {
        // TODO
			}
		);
		parser.hooks.exportDeclaration.tap(
			"HarmonyExportDependencyParserPlugin",
			statement => {}
		);
		parser.hooks.exportSpecifier.tap(
			"HarmonyExportDependencyParserPlugin",
			(statement, id, name, idx) => {
        // TODO
			}
		);
		parser.hooks.exportImportSpecifier.tap(
			"HarmonyExportDependencyParserPlugin",
			(statement, source, id, name, idx) => {
        // TODO
			}
		);
	}
};
