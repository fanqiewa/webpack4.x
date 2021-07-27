
"use strict";

const GraphHelpers = require("../GraphHelpers");

class EnsureChunkConditionsPlugin {
  apply(compiler) {
    // 注入hook - EnsureChunkConditionsPlugin
    compiler.hooks.compilation.tap(
      "EnsureChunkConditionsPlugin",
      compilation => {
				const handler = chunks => {
					let changed = false;
					for (const module of compilation.modules) {
						if (!module.chunkCondition) continue;
						// TODO
					}
					if (changed) return true;
				};
				compilation.hooks.optimizeChunksBasic.tap(
					"EnsureChunkConditionsPlugin",
					handler
				);
				compilation.hooks.optimizeExtractedChunksBasic.tap(
					"EnsureChunkConditionsPlugin",
					handler
				);
      }
    )
  }
}
module.exports = EnsureChunkConditionsPlugin;