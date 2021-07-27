
"use strict";

const UnsupportedWebAssemblyFeatureError = require("./UnsupportedWebAssemblyFeatureError");

class WasmFinalizeExportsPlugin {
  apply(compiler) {
    // 注入hook - WasmFinalizeExportsPlugin
		compiler.hooks.compilation.tap("WasmFinalizeExportsPlugin", compilation => {
      compilation.hooks.finishModules.tap(
				"WasmFinalizeExportsPlugin",
				modules => {
          for (const module  of modules) {
            // 如果是 WebAssembly模块
            if (module.type.startsWith("webassembly") === true) {
              // TODO
            }
          }
				}
			);
    })
  }
}

module.exports = WasmFinalizeExportsPlugin;
