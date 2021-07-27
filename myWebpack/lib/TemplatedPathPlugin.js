
"use strict";
class TemplatedPathPlugin {
	apply(compiler) {
    // 注入hook- TemplatedPathPlugin
		compiler.hooks.compilation.tap("TemplatedPathPlugin", compilation => {
      const mainTemplate = compilation.mainTemplate;

			mainTemplate.hooks.assetPath.tap(
				"TemplatedPathPlugin",
				replacePathVariables
			);

			mainTemplate.hooks.globalHash.tap(
				"TemplatedPathPlugin",
				(chunk, paths) => {
          // TODO
				}
			);

			mainTemplate.hooks.hashForChunk.tap(
				"TemplatedPathPlugin",
				(hash, chunk) => {
          // TODO
				}
			);
    })
  }
}
module.exports = TemplatedPathPlugin;