
/**
 * 协调同步导入依赖处理插件
 */
"use strict";

const { SyncBailHook } = require("tapable");
const HarmonyImportSideEffectDependency = require("./HarmonyImportSideEffectDependency");
const HarmonyImportSpecifierDependency = require("./HarmonyImportSpecifierDependency");
const HarmonyAcceptImportDependency = require("./HarmonyAcceptImportDependency");
const HarmonyAcceptDependency = require("./HarmonyAcceptDependency");
const ConstDependency = require("./ConstDependency");

module.exports = class HarmonyImportDependencyParserPlugin {
	constructor(moduleOptions) {
		this.strictExportPresence = moduleOptions.strictExportPresence;
		this.strictThisContextOnImports = moduleOptions.strictThisContextOnImports;
	}

	apply(parser) {
		// 注入hook - import
		parser.hooks.import.tap(
			"HarmonyImportDependencyParserPlugin",
			(statement, source) => {
				// 导入模块的序号
        parser.state.lastHarmonyImportOrder =
					(parser.state.lastHarmonyImportOrder || 0) + 1;
				const clearDep = new ConstDependency("", statement.range);
				clearDep.loc = statement.loc;
				// 添加一个干净的依赖
				parser.state.module.addDependency(clearDep);
				const sideEffectDep = new HarmonyImportSideEffectDependency(
					source,
					parser.state.module,
					parser.state.lastHarmonyImportOrder,
					parser.state.harmonyParserScope
				);
				sideEffectDep.loc = statement.loc;
				parser.state.module.addDependency(sideEffectDep);
				return true;
			}
		);
		// 注入hook - importSpecifier
		parser.hooks.importSpecifier.tap(
			"HarmonyImportDependencyParserPlugin",
			(statement, source, id, name) => {
				// 删除定义名
				parser.scope.definitions.delete(name);
				// 重命名导入模块
				// e.g. { "util": null }
				// => { "util": "imported var" }
				parser.scope.renames.set(name, "imported var");
				// 定义一个协调同步分类
				if (!parser.state.harmonySpecifier) {
					parser.state.harmonySpecifier = new Map();
				}
				// 设置协调分类
				// e.g. { "util": {
				//		source: "./utils",
				// 		id: "default",
				//    sourceOrder: 1
				// } }
				parser.state.harmonySpecifier.set(name, {
					source,
					id,
					sourceOrder: parser.state.lastHarmonyImportOrder
				});
				return true;
			}
		);
		parser.hooks.expression
			.for("imported var")
			.tap("HarmonyImportDependencyParserPlugin", expr => {
        // TODO
			});
		parser.hooks.expressionAnyMember
			.for("imported var")
			.tap("HarmonyImportDependencyParserPlugin", expr => {
        // TODO
			});
		if (this.strictThisContextOnImports) {
      // TODO
		}
		parser.hooks.call
			.for("imported var")
			.tap("HarmonyImportDependencyParserPlugin", expr => {
        // TODO
			});
		if (!parser.hooks.hotAcceptCallback) {
			parser.hooks.hotAcceptCallback = new SyncBailHook([
				"expression",
				"requests"
			]);
		}
		if (!parser.hooks.hotAcceptWithoutCallback) {
			parser.hooks.hotAcceptWithoutCallback = new SyncBailHook([
				"expression",
				"requests"
			]);
		}
		parser.hooks.hotAcceptCallback.tap(
			"HarmonyImportDependencyParserPlugin",
			(expr, requests) => {
        // TODO
			}
		);
		parser.hooks.hotAcceptWithoutCallback.tap(
			"HarmonyImportDependencyParserPlugin",
			(expr, requests) => {
        // TODO
			}
		);
	}
};
