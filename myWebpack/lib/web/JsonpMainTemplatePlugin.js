
"use strict";

const { SyncWaterfallHook } = require("tapable");
const Template = require("../Template");

class JsonpMainTemplatePlugin {
  apply(mainTemplate) {
    const needChunkOnDemandLoadingCode = chunk => {
      // TODO
    }
    const needChunkLoadingCode = chunk => {
      // TODO
    }
    const needEntryDeferringCode = chunk => {
      // TODO
    }
    const needPrefetchingCode = chunk => {
      // TODO
    }

    ["jsonpScript", "linkPreload", "linkPrefetch"].forEach(hook => {
      if (!mainTemplate.hooks[hook]) {
				mainTemplate.hooks[hook] = new SyncWaterfallHook([
					"source",
					"chunk",
					"hash"
				]);
      }
    });
    
		const getScriptSrcPath = (hash, chunk, chunkIdExpression) => {
			const chunkFilename = mainTemplate.outputOptions.chunkFilename;
			const chunkMaps = chunk.getChunkMaps();
			return mainTemplate.getAssetPath(JSON.stringify(chunkFilename), {
				hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
				hashWithLength: length =>
					`" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
				chunk: {
					id: `" + ${chunkIdExpression} + "`,
					hash: `" + ${JSON.stringify(
						chunkMaps.hash
					)}[${chunkIdExpression}] + "`,
					hashWithLength(length) {
						const shortChunkHashMap = Object.create(null);
						for (const chunkId of Object.keys(chunkMaps.hash)) {
							if (typeof chunkMaps.hash[chunkId] === "string") {
								shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(
									0,
									length
								);
							}
						}
						return `" + ${JSON.stringify(
							shortChunkHashMap
						)}[${chunkIdExpression}] + "`;
					},
					name: `" + (${JSON.stringify(
						chunkMaps.name
					)}[${chunkIdExpression}]||${chunkIdExpression}) + "`,
					contentHash: {
						javascript: `" + ${JSON.stringify(
							chunkMaps.contentHash.javascript
						)}[${chunkIdExpression}] + "`
					},
					contentHashWithLength: {
						javascript: length => {
							const shortContentHashMap = {};
							const contentHash = chunkMaps.contentHash.javascript;
							for (const chunkId of Object.keys(contentHash)) {
								if (typeof contentHash[chunkId] === "string") {
									shortContentHashMap[chunkId] = contentHash[chunkId].substr(
										0,
										length
									);
								}
							}
							return `" + ${JSON.stringify(
								shortContentHashMap
							)}[${chunkIdExpression}] + "`;
						}
					}
				},
				contentHashType: "javascript"
			});
		};
		mainTemplate.hooks.localVars.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk, hash) => {
        // TODO
			}
		);

		mainTemplate.hooks.jsonpScript.tap(
			"JsonpMainTemplatePlugin",
			(_, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.linkPreload.tap(
			"JsonpMainTemplatePlugin",
			(_, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.linkPrefetch.tap(
			"JsonpMainTemplatePlugin",
			(_, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.requireEnsure.tap(
			"JsonpMainTemplatePlugin load",
			(source, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.requireEnsure.tap(
			{
				name: "JsonpMainTemplatePlugin preload",
				stage: 10
			},
			(source, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.requireExtensions.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk) => {
        // TODO
			}
		);
		mainTemplate.hooks.bootstrap.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.beforeStartup.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.afterStartup.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.startup.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk, hash) => {
        // TODO
			}
		);
		mainTemplate.hooks.hotBootstrap.tap(
			"JsonpMainTemplatePlugin",
			(source, chunk, hash) => {
      // TODO
		  }
    );
  }
}