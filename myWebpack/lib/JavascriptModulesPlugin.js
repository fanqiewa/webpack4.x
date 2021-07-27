/**
 * Javascipt模块插件
 */
"use strict";

const Parser = require("./Parser");
const Template = require("./Template");
const { ConcatSource } = require("webpack-sources");
const JavascriptGenerator = require("./JavascriptGenerator");
const createHash = require("./util/createHash");

class JavascriptModulesPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "JavascriptModulesPlugin",
      (compilation, { normalModuleFactory }) => {
				normalModuleFactory.hooks.createParser
					.for("javascript/auto")
					.tap("JavascriptModulesPlugin", options => {
						// 返回默认的parser处理对象
						return new Parser(options, "auto");
					});
				normalModuleFactory.hooks.createParser
					.for("javascript/dynamic")
					.tap("JavascriptModulesPlugin", options => {
            // TODO
					});
				normalModuleFactory.hooks.createParser
					.for("javascript/esm")
					.tap("JavascriptModulesPlugin", options => {
            // TODO
					});
				normalModuleFactory.hooks.createGenerator
					.for("javascript/auto")
					.tap("JavascriptModulesPlugin", () => {
						return new JavascriptGenerator();
					});
				normalModuleFactory.hooks.createGenerator
					.for("javascript/dynamic")
					.tap("JavascriptModulesPlugin", () => {
            // TODO
					});
				normalModuleFactory.hooks.createGenerator
					.for("javascript/esm")
					.tap("JavascriptModulesPlugin", () => {
            // TODO
					});
				compilation.mainTemplate.hooks.renderManifest.tap(
					"JavascriptModulesPlugin",
					(result, options) => {
            // TODO
					}
				);
				compilation.mainTemplate.hooks.modules.tap(
					"JavascriptModulesPlugin",
					(source, chunk, hash, moduleTemplate, dependencyTemplates) => {
            // TODO
					}
				);
				compilation.chunkTemplate.hooks.renderManifest.tap(
					"JavascriptModulesPlugin",
					(result, options) => {
            // TODO
					}
				);
				compilation.hooks.contentHash.tap("JavascriptModulesPlugin", chunk => {
          // TODO
				});
      }
    )
  }
}

module.exports = JavascriptModulesPlugin;
