/**
 * 单入口参数插件
 */
"use strict";
const SingleEntryDependency = require("./dependencies/SingleEntryDependency");

class SingleEntryPlugin {
  constructor(context, entry, name) {
    this.context = context;
    this.entry = entry;
    this.name = name;
  }

  apply(compiler) {
    // 注入hook - SingleEntryPlugin
    compiler.hooks.compilation.tap(
      "SingleEntryPlugin",
      (compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					SingleEntryDependency,
					normalModuleFactory
				);
      }
    );

    // 异步注入hook - SingleEntryPlugin
    compiler.hooks.make.tapAsync(
      "SingleEntryPlugin",
      (compilation, callback) => {
        const { entry, name, context } = this;
        // 创建依赖
        const dep = SingleEntryPlugin.createDependency(entry, name);
				compilation.addEntry(context, dep, name, callback);
      }
    )
  }

  // 创建依赖项
  static createDependency(entry, name) {
    const dep = new SingleEntryDependency(entry);
		dep.loc = { name };
		return dep;
  }
}