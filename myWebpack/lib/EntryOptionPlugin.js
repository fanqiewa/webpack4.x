/**
 * 入口参数插件
 */
"use strict";

const SingleEntryPlugin = require("./SingleEntryPlugin");
const MultiEntryPlugin = require("./MultiEntryPlugin");
const DynamicEntryPlugin = require("./DynamicEntryPlugin");

const itemToPlugin = (context, item, name) => {
  if (Array.isArray(item)) {
    // TODO
    return new MultiEntryPlugin(context, item, name);
  }
  return new SingleEntryPlugin(context, item, name);
}

module.exports = class EntryOptionPlugin {

  apply(compiler) {
    // 注入hook - EntryOptionPlugin
    compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
      if (typeof entry === "string" || Array.isArray(entry)) {
				itemToPlugin(context, entry, "main").apply(compiler);
      } else if (typeof entry === "object") {
        for (const name of Object.keys(entry)) {
          itemToPlugin(context, entry[name], name).apply(compiler);
        }
      } else if (typeof entry === "function") {
        // TODO
        new DynamicEntryPlugin(context, entry).apply(compiler);
      }
      return true;
    })
  }
}