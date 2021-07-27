/**
 * webpack 打出来的 chunk.js 数量多，影响加载速度，合并配置一下即可
 */


"use strict";

const validateOptions = require("schema-utils");
const schema = require("../../schemas/plugins/optimize/LimitChunkCountPlugin.json");
const LazyBucketSortedSet = require("../util/LazyBucketSortedSet");

const compareNumbers = (a, b) => a - b;

class LimitChunkCountPlugin {
  constructor(options) {
    if (!options) options = {};

    validateOptions(schema, options, "Limit Chunk Count Plugin");
    this.options = options;
  }

  apply(compiler) {
		const options = this.options;
		compiler.hooks.compilation.tap("LimitChunkCountPlugin", compilation => {
			// seal闭环函数执行时触发optimizeChunksAdvanced
      compilation.hooks.optimizeChunksAdvanced.tap(
				"LimitChunkCountPlugin",
				chunks => {
          const maxChunks = options.maxChunks;
          if (!maxChunks) return;
          if (maxChunks < 1) return;
          if (chunks.length <= maxChunks) return;

          // TODO
        }
      );
    });
  }
}

module.exports = LimitChunkCountPlugin;