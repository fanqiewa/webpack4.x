
"use strict";

const crypto = require("crypto");
const SortableSet = require("../util/SortableSet");
const GraphHelpers = require("../GraphHelpers");
const { isSubset } = require("../util/SetHelpers");
const deterministicGrouping = require("../util/deterministicGrouping");
const MinMaxSizeWarning = require("./MinMaxSizeWarning");
const contextify = require("../util/identifier").contextify;


const ASYNC_CHUNK_FILTER = chunk => !chunk.canBeInitial();

module.exports = class SplitChunksPlugin {
	constructor(options) {
		this.options = SplitChunksPlugin.normalizeOptions(options);
	}
  
  // 格式化options
  static normalizeOptions(options = {}) {
		return {
			chunksFilter: SplitChunksPlugin.normalizeChunksFilter(
				options.chunks || "all"
			),
			minSize: options.minSize || 0,
			enforceSizeThreshold: options.enforceSizeThreshold || 0,
			maxSize: options.maxSize || 0,
			minChunks: options.minChunks || 1,
			maxAsyncRequests: options.maxAsyncRequests || 1,
			maxInitialRequests: options.maxInitialRequests || 1,
			hidePathInfo: options.hidePathInfo || false,
			filename: options.filename || undefined,
			getCacheGroups: SplitChunksPlugin.normalizeCacheGroups({
				cacheGroups: options.cacheGroups,
				name: options.name,
				automaticNameDelimiter: options.automaticNameDelimiter,
				automaticNameMaxLength: options.automaticNameMaxLength
			}),
			automaticNameDelimiter: options.automaticNameDelimiter,
			automaticNameMaxLength: options.automaticNameMaxLength || 109,
			fallbackCacheGroup: SplitChunksPlugin.normalizeFallbackCacheGroup(
				options.fallbackCacheGroup || {},
				options
			)
		};
  }

  // 格式化名称
  static normalizeName({
    name,
    automaticNameDelimiter,
    automaticNamePrefix,
    automaticNameMaxLength
  }) {
    if (name === true) {
      const cache = new WeakMap();
      const fn = (module, chunks, cacheGroup) => {
        // TODO
      }
      return fn;
    }
  }

  // 格式化chunk过滤
  static normalizeChunksFilter(chunks) {
    if (chunks === "initial" /* 初始的 */) {
      // TODO
    }
    if (chunks === "async") {
      return ASYNC_CHUNK_FILTER;
    }
    if (chunks === "all") {
      // TODO
    }
    if (typeof chunks === "function") return chunks;
  }

  // 格式化回退缓存组
  static normalizeFallbackCacheGroup(
    {
      minSize = undefined,
      maxSize = undefined,
      automaticNameDelimiter = undefined
    },
    {
      minSize: defaultMinSize = undefined,
      maxSize: defaultMaxSize = undefined,
      automaticNameDelimiter: defaultAutomaticNameDelimiter = undefined
    }
  ) {
    return {
      minSize: typeof minSize === "number" ? minSize : defaultMinSize || 0,
      maxSize: typeof maxSize === "number" ? maxSize : defaultMaxSize || 0,
      automaticNameDelimiter:
        automaticNameDelimiter || defaultAutomaticNameDelimiter || "~"
    }
  }

  // 格式化缓存组
  static normalizeCacheGroups({
    cacheGroups,
    name,
    automaticNameDelimiter,
    automaticNameMaxLength
  }) {
    if (typeof cacheGroups === "function") {
      // TODO
    }
    if (cacheGroups && typeof cacheGroups === "object") {
      const fn = module => {
        let results;
        for (const key of Object.keys(cacheGroups)) {
          let option = cacheGroups[key];
          if (option === false) continue;
          if (option instanceof RegExp || typeof option === "string") {
            // TODO
          }
          if (typeof option === "function") {
            // TODO
          } else if (SplitChunksPlugin.checkTest(option.test, module)) {
            if (results === undefined) results = [];
            results.push({
              key: key,
              priority: option.priority,
              getName:
                SplitChunksPlugin.normalizeName({
                  name: option.name || name,
                  automaticNameDelimiter:
                    typeof option.automaticNameDelimiter === "string"
                      ? option.automaticNameDelimiter
                      : automaticNameDelimiter,
                  automaticNamePrefix: option.automaticNamePrefix,
                  automaticNameMaxLength:
                    option.automaticNameMaxLength || automaticNameMaxLength
                }) || (() => {}),
              chunksFilter: SplitChunksPlugin.normalizeChunksFilter(
                option.chunks
              ),
              enforce: option.enforce,
              minSize: option.minSize,
							enforceSizeThreshold: option.enforceSizeThreshold,
							maxSize: option.maxSize,
							minChunks: option.minChunks,
							maxAsyncRequests: option.maxAsyncRequests,
							maxInitialRequests: option.maxInitialRequests,
							filename: option.filename,
							reuseExistingChunk: option.reuseExistingChunk
            });
          }
        }
        return results;
      };
      return fn;
    }
    const fn = () => {};
    return fn;
  }

  static checkTest(test, module) {
    if (test === undefined) return true;
    if (typeof test === "function") {
      // TODO
    }
    if (typeof test === "boolean") return test;
    if (typeof test === "string") {
      // TODO
    }
    if (test instanceof RegExp) {
      if (module.nameForCondition && test.test(module.nameForCondition)) {
        return true;
      }
      for (const chunk of module.chunksIterable) {
        if (chunk.name && test.test(chunk.name)) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

	apply(compiler) {
    // 注入hook - SplitChunksPlugin
		compiler.hooks.thisCompilation.tap("SplitChunksPlugin", compilation => {
      let alreadyOptimized = false;
			compilation.hooks.unseal.tap("SplitChunksPlugin", () => {
        // TODO
			});
			compilation.hooks.optimizeChunksAdvanced.tap(
				"SplitChunksPlugin",
				chunks => {
          // 切割chunk插件
          if (alreadyOptimized) return;
          alreadyOptimized = true;
          const indexMap = new Map();
          let index = 1;
          for (const chunk of chunks) {
            indexMap.set(chunk, index++);
          }
          // 获取chunks的key
          const getKey = chunks => {
            return Array.from(chunks, c => indexMap.get(c))
              .sort(compareNumbers)
              .join();
          }

          const chunkSetsInGraph = new Map();
          for (const module of compilation.modules) {
            const chunksKey = getKey(module.chunksIterable);
            if (!chunkSetsInGraph.has(chunksKey)) {
              chunkSetsInGraph.set(chunksKey, new Set(module.chunksIterable));
            }
          }

          const chunkSetsByCount = new Map();
          for (const chunksSet of chunkSetsInGraph.values()) {
            const count = chunksSet.size;
            let array = chunkSetsByCount.get(count);
            if (array === undefined) {
              array = [];
              chunkSetsByCount.set(count, array);
            }
            array.push(chunksSet);
          }

          const combinationsCache = new Map();

          // 获取组合
          const getCombinations = key => {
            const chunksSet = chunkSetsInGraph.get(key);
            var array = [chunksSet];
            if (chunksSet.size > 1) {
              // TODO
            }
            return array;
          }

          const selectedChunksCacheByChunksSet = new WeakMap();

          const getSelectedChunks = (cunks, chunkFilter) => {

          }

          const chunksInfoMap = new Map();
          
          const addModuleToChunksInfoMap = (
            cacheGroup,
            cacheGroupIndex,
            selectedChunks,
            selectedChunksKey,
            module
          ) => {

          }

          for (const module of compilation.modules) {
            // 获取缓存的group
            let cacheGroups = this.options.getCacheGroups(module);
            if (!Array.isArray(cacheGroups) || cacheGroups.length === 0) {
              continue;
            }

            const chunksKey = getKey(module.chunksIterable);
            let combs = combinationsCache.get(chunksKey);
            if (combs === undefined) {
              combs = getCombinations(chunksKey);
              combinationsCache.set(chunksKey, combs);
            }

            let cacheGroupIndex = 0;
            for (const cacheGroupSource of cacheGroups) {
              const minSize =
                cacheGroupSource.minSize !== undefined
                  ? cacheGroupSource.minSize
                  : cacheGroupSource.enforce
                  ? 0
                  : this.options.minSize;
              const enforceSizeThreshold =
                cacheGroupSource.enforceSizeThreshold !== undefined
                  ? cacheGroupSource.enforceSizeThreshold
                  : cacheGroupSource.enforce
                  ? 0
                  : this.options.enforceSizeThreshold;
              const cacheGroup = {
                key: cacheGroupSource.key,
                priority: cacheGroupSource.priority || 0,
                chunksFilter:
                  cacheGroupSource.chunksFilter || this.options.chunksFilter,
                minSize,
                minSizeForMaxSize:
                  cacheGroupSource.minSize !== undefined
                    ? cacheGroupSource.minSize
                    : this.options.minSize,
                enforceSizeThreshold,
                maxSize:
                  cacheGroupSource.maxSize !== undefined
                    ? cacheGroupSource.maxSize
                    : cacheGroupSource.enforce
                    ? 0
                    : this.options.maxSize,
                minChunks:
                  cacheGroupSource.minChunks !== undefined
                    ? cacheGroupSource.minChunks
                    : cacheGroupSource.enforce
                    ? 1
                    : this.options.minChunks,
                maxAsyncRequests:
                  cacheGroupSource.maxAsyncRequests !== undefined
                    ? cacheGroupSource.maxAsyncRequests
                    : cacheGroupSource.enforce
                    ? Infinity
                    : this.options.maxAsyncRequests,
                maxInitialRequests:
                  cacheGroupSource.maxInitialRequests !== undefined
                    ? cacheGroupSource.maxInitialRequests
                    : cacheGroupSource.enforce
                    ? Infinity
                    : this.options.maxInitialRequests,
                getName:
                  cacheGroupSource.getName !== undefined
                    ? cacheGroupSource.getName
                    : this.options.getName,
                filename:
                  cacheGroupSource.filename !== undefined
                    ? cacheGroupSource.filename
                    : this.options.filename,
                automaticNameDelimiter:
                  cacheGroupSource.automaticNameDelimiter !== undefined
                    ? cacheGroupSource.automaticNameDelimiter
                    : this.options.automaticNameDelimiter,
                reuseExistingChunk: cacheGroupSource.reuseExistingChunk,
                _validateSize: minSize > 0,
                _conditionalEnforce: enforceSizeThreshold > 0
              };

              for (const chunkCombination of combs) {
                if (chunkCombination.size < cacheGroup.minChunks) continue;

                // TODO
              }
              cacheGroupIndex++;
            }
          }

          for (const pair of chunksInfoMap) {
            // TODO
          }

          const maxSizeQueueMap = new Map();

          while (chunksInfoMap.size > 0) {
            // TODO
          }

          const incorrectMinMaxSizeSet = new Set();

          for (const chunk of compilation.chunks.slice()) {
            const { minSize, maxSize, automaticNameDelimiter, keys } =
              maxSizeQueueMap.get(chunk) || this.options.fallbackCacheGroup;
            if (!maxSize) continue;
            // TODO
          }
        }
			);
    })
  }
}