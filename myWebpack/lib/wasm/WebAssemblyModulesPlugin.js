
"use strict";

const Generator = require("../Generator");
const WebAssemblyExportImportedDependency = require("../dependencies/WebAssemblyExportImportedDependency");
const WebAssemblyImportDependency = require("../dependencies/WebAssemblyImportDependency");
const WebAssemblyInInitialChunkError = require("./WebAssemblyInInitialChunkError");

let WebAssemblyGenerator;
let WebAssemblyJavascriptGenerator;
let WebAssemblyParser;

class WebAssemblyModulesPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // 注入hook - WebAssemblyModulesPlugin
    compiler.hooks.compilation.tap(
      "WebAssemblyModulesPlugin",
      (compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					WebAssemblyImportDependency,
					normalModuleFactory
				);

				compilation.dependencyFactories.set(
					WebAssemblyExportImportedDependency,
					normalModuleFactory
				);

				normalModuleFactory.hooks.createParser
					.for("webassembly/experimental")
					.tap("WebAssemblyModulesPlugin", () => {
            // TODO
					});

				normalModuleFactory.hooks.createGenerator
					.for("webassembly/experimental")
					.tap("WebAssemblyModulesPlugin", () => {
            // TODO
					});

				compilation.chunkTemplate.hooks.renderManifest.tap(
					"WebAssemblyModulesPlugin",
					(result, options) => {
            // TODO
					}
				);

				// 注入hooks - afterChunks
				compilation.hooks.afterChunks.tap("WebAssemblyModulesPlugin", () => {
					const initialWasmModules = new Set();
					for (const chunk of compilation.chunks) {
						if (chunk.canBeInitial()) {
							for (const module of chunk.modulesIterable) {
								if (module.type.startsWith("webassembly")) {
									initialWasmModules.add(module);
								}
							}
						}
					}
					for (const module of initialWasmModules) {
						// TODO
					}
				});
      }
    )
  }
}

module.exports = WebAssemblyModulesPlugin;