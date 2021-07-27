/**
 * Jsonp模板插件
 */
"use strict";

const JsonpMainTemplatePlugin = require("./JsonpMainTemplatePlugin");
const JsonpChunkTemplatePlugin = require("./JsonpChunkTemplatePlugin");
const JsonpHotUpdateChunkTemplatePlugin = require("./JsonpHotUpdateChunkTemplatePlugin");

class JsonpTemplatePlugin {
  apply(compiler) {
    // 注入hook - JsonpTemplatePlugin
    compiler.hooks.thisCompilation.tap("JsonpTemplatePlugin", compilation => {
      new JsonpMainTemplatePlugin().apply(compilation.mainTemplate);
			new JsonpChunkTemplatePlugin().apply(compilation.chunkTemplate);
			new JsonpHotUpdateChunkTemplatePlugin().apply(
				compilation.hotUpdateChunkTemplate
			);
    })
  }
}

module.exports = JsonpTemplatePlugin;