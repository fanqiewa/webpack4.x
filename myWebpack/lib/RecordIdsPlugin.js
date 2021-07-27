
"use strict";

const identifierUtils = require("./util/identifier");

class RecordIdsPlugin {
	constructor(options) {
		this.options = options || {};
	}

  apply(compiler) {
		const portableIds = this.options.portableIds;
    // 注入hook - RecordIdsPlugin
		compiler.hooks.compilation.tap("RecordIdsPlugin", compilation => {
      compilation.hooks.recordModules.tap(
				"RecordIdsPlugin",
				(modules, records) => {
					if (!records.modules) records.modules = {};
					if (!records.modules.byIdentifier) records.modules.byIdentifier = {};
					if (!records.modules.usedIds) records.modules.usedIds = {};
					for (const module of modules) {
						if (typeof module.id !== "number") continue;
						const identifier = portableIds
							? identifierUtils.makePathsRelative(
									compiler.context,
									module.identifier(),
									compilation.cache
							  )
							: module.identifier();
						records.modules.byIdentifier[identifier] = module.id;
						records.modules.usedIds[module.id] = module.id;
					}
				}
			);
			compilation.hooks.reviveModules.tap(
				"RecordIdsPlugin",
				(modules, records) => {
					if (!records.modules) return;
					// TODO
				}
			);

			const getModuleIdentifier = module => {
        // TODO
			};

			const getChunkSources = chunk => {
				const sources = [];
				for (const chunkGroup of chunk.groupsIterable) {
					const index = chunkGroup.chunks.indexOf(chunk);
					if (chunkGroup.name) {
						sources.push(`${index} ${chunkGroup.name}`);
					} else {
						for (const origin of chunkGroup.origins) {
							if (origin.module) {
								if (origin.request) {
									sources.push(
										`${index} ${getModuleIdentifier(origin.module)} ${
											origin.request
										}`
									);
								} else if (typeof origin.loc === "string") {
									sources.push(
										`${index} ${getModuleIdentifier(origin.module)} ${
											origin.loc
										}`
									);
								} else if (
									origin.loc &&
									typeof origin.loc === "object" &&
									origin.loc.start
								) {
									sources.push(
										`${index} ${getModuleIdentifier(
											origin.module
										)} ${JSON.stringify(origin.loc.start)}`
									);
								}
							}
						}
					}
				}
				return sources;
			};

			compilation.hooks.recordChunks.tap(
				"RecordIdsPlugin",
				(chunks, records) => {
					if (!records.chunks) records.chunks = {};
					if (!records.chunks.byName) records.chunks.byName = {};
					if (!records.chunks.bySource) records.chunks.bySource = {};
					const usedIds = new Set();
					for (const chunk of chunks) {
						if (typeof chunk.id !== "number") continue;
						const name = chunk.name;
						if (name) records.chunks.byName[name] = chunk.id;
						const sources = getChunkSources(chunk);
						for (const source of sources) {
							records.chunks.bySource[source] = chunk.id;
						}
						usedIds.add(chunk.id);
					}
					records.chunks.usedIds = Array.from(usedIds).sort();
				}
			);
			compilation.hooks.reviveChunks.tap(
				"RecordIdsPlugin",
				(chunks, records) => {
					if (!records.chunks) return;
					// TODO
				}
			);
    })
  }
}

module.exports = RecordIdsPlugin;