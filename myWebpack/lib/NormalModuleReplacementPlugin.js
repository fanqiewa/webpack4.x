/**
 * NormalModuleReplacementPlugin 允许你用 newResource 替换与 resourceRegExp 匹配的资源。如果 newResource 是相对路径，它会相对于先前的资源被解析。
 * 如果 newResource 是函数，它将会覆盖之前被提供资源的请求。
 */

"use strict";

const path = require("path");

class NormalModuleReplacementPlugin {
  constructor(resourceRegExp, newResource) {
    this.resourceRegExp = resourceRegExp;
    this.newResource = newResource;
  }

  apply(compiler) {
		const resourceRegExp = this.resourceRegExp;
		const newResource = this.newResource;
		compiler.hooks.normalModuleFactory.tap(
			"NormalModuleReplacementPlugin",
      nmf => {
				nmf.hooks.beforeResolve.tap("NormalModuleReplacementPlugin", result => {
					if (!result) return;
					if (resourceRegExp.test(result.request)) {
						if (typeof newResource === "function") {
							newResource(result);
						} else {
							result.request = newResource;
						}
					}
					return result;
				});
				nmf.hooks.afterResolve.tap("NormalModuleReplacementPlugin", result => {
					if (!result) return;
					if (resourceRegExp.test(result.resource)) {
						if (typeof newResource === "function") {
							newResource(result);
						} else {
							result.resource = path.resolve(
								path.dirname(result.resource),
								newResource
							);
						}
					}
					return result;
				});
      }
    );
  }
}