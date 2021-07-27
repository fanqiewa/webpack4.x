/**
 * Json模块插件
 */
"use strict";

const JsonParser = require("./JsonParser");
const JsonGenerator = require("./JsonGenerator");

class JsonModulesPlugin {
  apply(compiler) {
    // 注入hook - JsonModulesPlugin
    compiler.hooks.compilation.tap(
      "JsonModulesPlugin",
      (compilation, { normalModuleFactory }) => {
				normalModuleFactory.hooks.createParser
					.for("json")
					.tap("JsonModulesPlugin", () => {
            // TODO
					});
				normalModuleFactory.hooks.createGenerator
					.for("json")
					.tap("JsonModulesPlugin", () => {
            // TODO
					});
      }
    )
  }
}

module.exports = JsonModulesPlugin;
