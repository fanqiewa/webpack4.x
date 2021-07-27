
"use strict";
const EntrypointsOverSizeLimitWarning = require("./EntrypointsOverSizeLimitWarning");
const AssetsOverSizeLimitWarning = require("./AssetsOverSizeLimitWarning");
const NoAsyncChunksWarning = require("./NoAsyncChunksWarning");

module.exports = class SizeLimitsPlugin {
	constructor(options) {
		this.hints = options.hints;
		this.maxAssetSize = options.maxAssetSize;
		this.maxEntrypointSize = options.maxEntrypointSize;
		this.assetFilter = options.assetFilter;
	}

  apply(compiler) {
		const entrypointSizeLimit = this.maxEntrypointSize;
		const assetSizeLimit = this.maxAssetSize;
		const hints = this.hints;
		const assetFilter =
			this.assetFilter || ((name, source, info) => !info.development);
  
    // 注入hook - SizeLimitsPlugin
    compiler.hooks.afterEmit.tap("SizeLimitsPlugin", compilation => {
      // TODO
    })
  }
};
