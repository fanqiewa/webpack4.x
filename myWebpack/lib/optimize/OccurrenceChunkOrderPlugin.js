
"use strict";

const validateOptions = require("schema-utils");
const schema = require("../../schemas/plugins/optimize/OccurrenceOrderChunkIdsPlugin.json");

class OccurrenceOrderChunkIdsPlugin {
  
	constructor(options = {}) {
		validateOptions(schema, options, "Occurrence Order Chunk Ids Plugin");
		this.options = options;
	}

  apply(compiler) {
		const prioritiseInitial = this.options.prioritiseInitial;
    // 注入hook - OccurrenceOrderChunkIdsPlugin
		compiler.hooks.compilation.tap(
			"OccurrenceOrderChunkIdsPlugin",
			compilation => {
				compilation.hooks.optimizeChunkOrder.tap(
					"OccurrenceOrderChunkIdsPlugin",
					chunks => {
						const occursInInitialChunksMap = new Map();
						const originalOrder = new Map();

						let i = 0;
						for (const c of chunks) {
							let occurs = 0;
							for (const chunkGroup of c.groupsIterable) {
								for (const parent of chunkGroup.parentsIterable) {
									if (parent.isInitial()) occurs++;
								}
							}
							occursInInitialChunksMap.set(c, occurs);
							originalOrder.set(c, i++);
						}

						chunks.sort((a, b) => {
							if (prioritiseInitial) {
								const aEntryOccurs = occursInInitialChunksMap.get(a);
								const bEntryOccurs = occursInInitialChunksMap.get(b);
								if (aEntryOccurs > bEntryOccurs) return -1;
								if (aEntryOccurs < bEntryOccurs) return 1;
							}
							const aOccurs = a.getNumberOfGroups();
							const bOccurs = b.getNumberOfGroups();
							if (aOccurs > bOccurs) return -1;
							if (aOccurs < bOccurs) return 1;
							const orgA = originalOrder.get(a);
							const orgB = originalOrder.get(b);
							return orgA - orgB;
						});
					}
				);
      }
    );
  }
}
module.exports = OccurrenceOrderChunkIdsPlugin;