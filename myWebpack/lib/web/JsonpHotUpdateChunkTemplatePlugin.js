
"use strict";

const { ConcatSource } = require("webpack-sources");

class JsonpHotUpdateChunkTemplatePlugin {
	apply(hotUpdateChunkTemplate) {
		hotUpdateChunkTemplate.hooks.render.tap(
			"JsonpHotUpdateChunkTemplatePlugin",
			(modulesSource, modules, removedModules, hash, id) => {
        // TODO
			}
		);
		hotUpdateChunkTemplate.hooks.hash.tap(
			"JsonpHotUpdateChunkTemplatePlugin",
			hash => {
        // TODO
			}
		);
	}
}

module.exports = JsonpHotUpdateChunkTemplatePlugin;
