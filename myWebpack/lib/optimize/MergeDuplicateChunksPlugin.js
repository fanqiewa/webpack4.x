
"use strict";


class MergeDuplicateChunksPlugin {
	apply(compiler) {
    // 注入hook - MergeDuplicateChunksPlugin
		compiler.hooks.compilation.tap(
			"MergeDuplicateChunksPlugin",
			compilation => {
				compilation.hooks.optimizeChunksBasic.tap(
					"MergeDuplicateChunksPlugin",
					chunks => {
						// 合并重复的chunk插件
						const notDuplicates = new Set();

						for (const chunk of chunks) {
							let possibleDuplicates;
							for (const module of chunk.modulesIterable) {
								if (possibleDuplicates === undefined) {
									for (const dup of module.chunksIterable) {
										if (
											dup !== chunk &&
											chunk.getNumberOfModules() === dup.getNumberOfModules() &&
											!notDuplicates.has(dup)
										) {
											// TODO
										}
									}
									if (possibleDuplicates === undefined) break;
								} else {
									// TODO
								}
							}

							if (
								possibleDuplicates !== undefined &&
								possibleDuplicates.size > 0
							) {
								// TODO
							}

							notDuplicates.add(chunk);
						}
					}
				);
			}
		);
	}
}
module.exports = MergeDuplicateChunksPlugin;