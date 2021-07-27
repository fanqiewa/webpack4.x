/**
 * Loader插件
 */
"use strict";

class LoaderTargetPlugin {
  constructor(target) {
    this.target = target;
  }

  apply(compiler) {
    // 注入插件 - LoaderTargetPlugin
    compiler.hooks.compilation.tap("LoaderTargetPlugin", compilation => {
      compilation.hooks.normalModuleLoader.tap(
				"LoaderTargetPlugin",
				loaderContext => {
					loaderContext.target = this.target;
				}
			);
    })
  }
}

module.exports = LoaderTargetPlugin;