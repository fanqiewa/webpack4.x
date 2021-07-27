
"use strict";

const Queue = require("../util/Queue");
const { intersect } = require("../util/SetHelpers");

class RemoveParentModulesPlugin {
  apply(compiler) {
    // 注入hook - RemoveParentModulesPlugin
    compiler.hooks.compilation.tap("RemoveParentModulesPlugin", compilation => {
      const handler = (chunks, chunkGroups) => {
        const queue = new Queue();
				const availableModulesMap = new WeakMap();

				for (const chunkGroup of compilation.entrypoints.values()) {
					availableModulesMap.set(chunkGroup, new Set());
					for (const child of chunkGroup.childrenIterable) {
						// TODO
					}
				}

				while (queue.length > 0) {
					// TODO
				}

				for (const chunk of chunks) {
					const availableModulesSets = Array.from(
						chunk.groupsIterable,
						chunkGroups => availableModulesMap.get(chunkGroup)
					);
					if (availableModulesSets.some(s => s === undefined)) continue;
					const availableModules =
						availableModulesSets.length === 1
							? availableModulesSets[0]
							: intersect(availableModulesSets);
					const numberOfModules = chunk.getNumberOfModules();
					const toRemove = new Set();
					if (numberOfModules < availableModules.size) {
						// TODO
					} else {
						for (const m of availableModules) {
							// TODO
						}
					}
					for (const module of toRemove) {
						// TODO
					}
				}
			};
			compilation.hooks.optimizeChunksBasic.tap(
				"RemoveParentModulesPlugin",
				handler
			);
			compilation.hooks.optimizeExtractedChunksBasic.tap(
				"RemoveParentModulesPlugin",
				handler
			);
    })
  }
}
module.exports = RemoveParentModulesPlugin;