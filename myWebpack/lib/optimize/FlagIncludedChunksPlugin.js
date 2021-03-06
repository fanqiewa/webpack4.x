
"use strict";

class FlagIncludedChunksPlugin {
	apply(compiler) {
    // 注入hook - FlagIncludedChunksPlugin
		compiler.hooks.compilation.tap("FlagIncludedChunksPlugin", compilation => {
      compilation.hooks.optimizeChunkIds.tap(
				"FlagIncludedChunksPlugin",
				chunks => {
					const moduleBits = new WeakMap();
					const modulesCount = compilation.modules.length;

					const modulo = 1 / Math.pow(1 / modulesCount, 1 / 31);
					const modulos = Array.from(
						{ length: 31 },
						(x, i) => Math.pow(modulo, i) | 0
					);

					let i = 0;
					for (const module of compilation.modules) {
						let bit = 30;
						while (i % modulos[bit] !== 0) {
							bit--;
						}
						moduleBits.set(module, 1 << bit);
						i++;
					}

					const chunkModulesHash = new WeakMap();
					for (const chunk of chunks) {
						let hash = 0;
						for (const module of chunk.modulesIterable) {
							hash |= moduleBits.get(module);
						}
						chunkModulesHash.set(chunk, hash);
					}

					for (const chunkA of chunks) {
						const chunkAHash = chunkModulesHash.get(chunkA);
						const chunkAModulesCount = chunkA.getNumberOfModules();
						if (chunkAModulesCount === 0) continue;
						let bestModule = undefined;
						for (const module of chunkA.modulesIterable) {
							if (
								bestModule === undefined ||
								bestModule.getNumberOfChunks() > module.getNumberOfChunks()
							)
								bestModule = module;
						}
						loopB: for (const chunkB of bestModule.chunksIterable) {
							if (chunkA === chunkB) continue;

							const chunkBModulesCount = chunkB.getNumberOfModules();

							if (chunkBModulesCount === 0) continue;

							if (chunkAModulesCount > chunkBModulesCount) continue;

							const chunkBHash = chunkModulesHash.get(chunkB);
							if ((chunkBHash & chunkAHash) !== chunkAHash) continue;

							for (const m of chunkA.modulesIterable) {
								if (!chunkB.containsModule(m)) continue loopB;
							}
							chunkB.ids.push(chunkA.id);
						}
					}
				}
			);
    })
  }
}
    
module.exports = FlagIncludedChunksPlugin;