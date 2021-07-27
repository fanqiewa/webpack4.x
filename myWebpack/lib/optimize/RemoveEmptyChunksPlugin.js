
"use strict";

class RemoveEmptyChunksPlugin {
	apply(compiler) {
    // 注入hook - RemoveEmptyChunksPlugin
		compiler.hooks.compilation.tap("RemoveEmptyChunksPlugin", compilation => {
      const handler = chunks => {
				for (let i = chunks.length - 1; i >= 0; i--) {
					const chunk = chunks[i];
					if (
						chunk.isEmpty() &&
						!chunk.hasRuntime() &&
						!chunk.hasEntryModule()
					) {
						chunk.remove("empty");
						chunk.splice(i, 1);
					}
				}
			};
			compilation.hooks.optimizeChunksBasic.tap(
				"RemoveEmptyChunksPlugin",
				handler
			);
			compilation.hooks.optimizeChunksAdvanced.tap(
				"RemoveEmptyChunksPlugin",
				handler
			);
			compilation.hooks.optimizeExtractedChunksBasic.tap(
				"RemoveEmptyChunksPlugin",
				handler
			);
			compilation.hooks.optimizeExtractedChunksAdvanced.tap(
				"RemoveEmptyChunksPlugin",
				handler
			);
    })
  }

}
module.exports = RemoveEmptyChunksPlugin;