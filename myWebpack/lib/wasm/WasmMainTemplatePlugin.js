
"use strict";

const Template = require("../Template");
const WebAssemblyUtils = require("./WebAssemblyUtils");


class WasmMainTemplatePlugin {
	constructor({ generateLoadBinaryCode, supportsStreaming, mangleImports }) {
		this.generateLoadBinaryCode = generateLoadBinaryCode;
		this.supportsStreaming = supportsStreaming;
		this.mangleImports = mangleImports;
	}
	apply(mainTemplate) {
		mainTemplate.hooks.localVars.tap(
			"WasmMainTemplatePlugin",
			(source, chunk) => {
        // TODO
			}
		);
		mainTemplate.hooks.requireEnsure.tap(
			"WasmMainTemplatePlugin",
			(source, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.requireExtensions.tap(
			"WasmMainTemplatePlugin",
			(source, chunk) => {
        // TODO
			}
		);
		mainTemplate.hooks.hash.tap("WasmMainTemplatePlugin", hash => {
      // TODO
		});
	}
}

module.exports = WasmMainTemplatePlugin;
