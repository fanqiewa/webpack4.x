/**
 * 上下文排除插件
 * 上下文是指带有诸如require('./locale/' + name + '.json').
 * 在初始化插件时提供 RegExp 作为参数以排除与其匹配的所有上下文。
 */
"use strict";

/*
  e.g. 
  module.exports = {
    plugins: [new webpack.ContextExclusionPlugin(/dont/)],
  };
*/
class ContextExclusionPlugin {
	constructor(negativeMatcher) {
		this.negativeMatcher = negativeMatcher;
	}

	apply(compiler) {
		compiler.hooks.contextModuleFactory.tap("ContextExclusionPlugin", cmf => {
			cmf.hooks.contextModuleFiles.tap("ContextExclusionPlugin", files => {
				return files.filter(filePath => !this.negativeMatcher.test(filePath));
			});
		});
	}
}

module.exports = ContextExclusionPlugin;