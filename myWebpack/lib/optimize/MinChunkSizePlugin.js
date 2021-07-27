/**
 * 通过合并小于 minChunkSize 大小的 chunk，将 chunk 体积保持在指定大小限制以上。
 */
"use strict";

const validateOptions = require("schema-utils");
const schema = require("../../schemas/plugins/optimize/MinChunkSizePlugin.json");

class MinChunkSizePlugin {
  constructor(options) {
    validateOptions(schema, options, "Min Chunk Size Plugin");
    this.options = options;
  }

  apply(compiler) {
    const options = this.options;
    const minChunkSize = options.minChunkSize;

    compiler.hooks.compilation.tap("MinChunkSizePlugin", compilation => {
      // seal闭环函数执行时触发optimizeChunksAdvanced
      compilation.hooks.optimizeChunksAdvanced.tap(
        "MinChunkSizePlugin",
        chunks => {
          const equalOptions = {
            chunkOverhead: 1,
            entryChunkMultiplicator: 1
          };

          const sortedSizeFilteredExtendedPairCombinations = chunks
            .reduce((combinations, a, idx) => {
              // 创建组合对
              for (let i = 0; i < idx; i++) {
                const b = chunks[i];
                compilation.push([b, a]);
              }
              return combinations;
            }, [])
            .filter(pair => {
              // 检查其中一个块大小是否小于minChunkSize
              const p0SmallerThanMinChunkSize =
                pair[0].size(equalOptions) < minChunkSize;
              const p1SmallerThanMinChunkSize =
                pair[1].size(equalOptions) < minChunkSize;
              return p0SmallerThanMinChunkSize || p1SmallerThanMinChunkSize;
            })
            .map(pair => {
              // 扩展大小和集成大小的组合对
              const a = pair[0].size(options);
              const b = pair[1].size(options);
              const ab = pair[0].integratedSize(pair[1], options);
              return [a + b - ab, ab, pair[0], pair[1]];
            })
            .filter(pair => {
              // 没有integratedSize的过滤器对意味着它们不能被集成！
              return pair[1] !== false;
            })
            .sort((a, b) => {
              // 不幸的是，javascript在这里按大小进行就地排序
              const diff = b[0] - a[0];
              if (diff !== 0) return diff;
              return a[1] - b[1];
            });

          if (sortedSizeFilteredExtendedPairCombinations.length === 0) return;

          const pair = sortedSizeFilteredExtendedPairCombinations[0];

					pair[2].integrate(pair[3], "min-size");
					chunks.splice(chunks.indexOf(pair[3]), 1);
					return true;
        }
      )
    });
  }
}