
"use strict";

const { ConcatSource } = require("webpack-sources");

class JsonpChunkTemplatePlugin {
	apply(chunkTemplate) {
		chunkTemplate.hooks.render.tap(
			"JsonpChunkTemplatePlugin",
			(modules, chunk) => {
        // TODO
			}
		);
		chunkTemplate.hooks.hash.tap("JsonpChunkTemplatePlugin", hash => {
      // TODO
		});
		chunkTemplate.hooks.hashForChunk.tap(
			"JsonpChunkTemplatePlugin",
			(hash, chunk) => {
        // TODO
			}
		);
	}
}
module.exports = JsonpChunkTemplatePlugin;
