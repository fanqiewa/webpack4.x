
"use strict";

const mm = require("micromatch");
const HarmonyExportImportedSpecifierDependency = require("../dependencies/HarmonyExportImportedSpecifierDependency");
const HarmonyImportSideEffectDependency = require("../dependencies/HarmonyImportSideEffectDependency");
const HarmonyImportSpecifierDependency = require("../dependencies/HarmonyImportSpecifierDependency");

class SideEffectsFlagPlugin {
  apply(compiler) {
    // 注入hook - SideEffectsFlagPlugin
		compiler.hooks.normalModuleFactory.tap("SideEffectsFlagPlugin", nmf => {
      rmf.hooks.module.tap("SideEffectsFlagPlugin", (module, data) => {
				const resolveData = data.resourceResolveData;
				if (
					resolveData &&
					resolveData.descriptionFileData &&
					resolveData.relativePath
				) {
					const sideEffects = resolveData.descriptionFileData.sideEffects;
					const hasSideEffects = SideEffectsFlagPlugin.moduleHasSideEffects(
						resolveData.relativePath,
						sideEffects
					);
					if (!hasSideEffects) {
						module.factoryMeta.sideEffectFree = true;
					}
				}

				return module;
      });
      rmf.hooks.module.tap("SideEffectsFlagPlugin", (module, data) => {
        if (data.settings.sideEffects === false) {
          // TODO
        } else if (data.settings.sideEffects === true) {
          // TODO
        }
      })
    });
    // 注入hook - SideEffectsFlagPlugin
		compiler.hooks.compilation.tap("SideEffectsFlagPlugin", compilation => {
      compilation.hooks.optimizeDependencies.tap(
				"SideEffectsFlagPlugin",
				modules => {
          const reexportMaps = new Map();

          for (const module of modules) {
            const removeDependencies = [];
            for (const dep of module.dependencies) {
              if (dep instanceof HarmonyImportSideEffectDependency) {
                if (dep.module && dep.module.factoryMeta.sideEffectFree) {
                  // TODO
                }
              } else if (
                dep instanceof HarmonyExportImportedSpecifierDependency
              ) {
                // TODO
              }
            }
          }

          for (const info of reexportMaps.values()) {
            // TODO
          }

          for (const info of reexportMaps.values()) {
            // TODO
          }

          for (const pair of reexportMaps) {
            // TODO
          }
				}
			);
    });
  }
  
  static moduleHasSideEffects(moduleName, flagValue) {
    switch (typeof flagValue) {
      case "undefined":
        return true;
      // TODO
    }
  }
}

module.exports = SideEffectsFlagPlugin;