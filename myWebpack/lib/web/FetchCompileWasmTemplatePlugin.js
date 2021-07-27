/**
 * wasm模板插件
 */
"use strict";

const WasmMainTemplatePlugin = require("../wasm/WasmMainTemplatePlugin");

class FetchCompileWasmTemplatePlugin {
	constructor(options) {
		this.options = options || {};
	}

  apply(compiler) {
    // 注入hook - FetchCompileWasmTemplatePlugin
    compiler.hooks.thisCompilation.tap(
      "FetchCompileWasmTemplatePlugin",
      compilation => {
				const mainTemplate = compilation.mainTemplate;
				const generateLoadBinaryCode = path =>
					`fetch(${mainTemplate.requireFn}.p + ${path})`;
          
				const plugin = new WasmMainTemplatePlugin(
					Object.assign(
						{
							generateLoadBinaryCode,
							supportsStreaming: true
						},
						this.options
					)
				);
				plugin.apply(mainTemplate);
      }
    );
  }
}
module.exports = FetchCompileWasmTemplatePlugin;
