/**
 * 函数模块模板插件
 */
"use strict";

const FunctionModuleTemplatePlugin = require("./FunctionModuleTemplatePlugin");

class FunctionModulePlugin {
  apply(compiler) {
    // 注入hook - FunctionModulePlugin
    compiler.hooks.compilation.tap("FunctionModulePlugin", compilation => {
      new FunctionModuleTemplatePlugin().apply(
        // TODO
			);
    })
  }
}

module.exports = FunctionModulePlugin;