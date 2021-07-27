/**
 * 忽略第三方包指定目录，让这些指定目录不要被打包进去
 */

"use strict";

const validateOptions = require("schema-utils");
const schema = require("../schemas/plugins/IgnorePlugin.json");

class IgnorePlugin {
  constructor(options) {
    if (arguments.length > 1 || options instanceof RegExp) {
      options = {
        resourceRegExp: arguments[0], // 一个 RegExp 来test资源
        contextRegExp: arguments[1] // （可选）一个 RegExp 来test上下文（目录）。
      };
    }

    validateOptions(schema, options, "IgnorePlugin");
    this.options = options;

    this.checkIgnore = this.checkIgnore.bind(this);
  }

  checkIgnore(result) {
    if (!result) return result;

    // 过滤功能
    if (
      "checkResource" in this.options &&
      this.options.checkResource &&
      this.options.checkResource(result.request, result.context)
    ) {
      // 在webpack5中已移除，因为checkResource已经获得了上下文。
      if ("checkContext" in this.options && this.options.checkContext) {
				if (this.options.checkContext(result.context)) {
					return null;
				}
			} else {
				return null;
			}
    }

		if (
			"resourceRegExp" in this.options &&
			this.options.resourceRegExp &&
			this.options.resourceRegExp.test(result.request)
		) {
			if ("contextRegExp" in this.options && this.options.contextRegExp) {
				if (this.options.contextRegExp.test(result.context)) {
					return null;
				}
			} else {
				return null;
			}
		}

		return result;
  }

  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap("IgnorePlugin", nmf => {
      nmf.hooks.beforeResolve.tap("IgnorePlugin", this.chechIgnore);
    });
    compiler.hooks.contextModuleFactory.tap("IgnorePlugin", cmf => {
			cmf.hooks.beforeResolve.tap("IgnorePlugin", this.checkIgnore);
    });
  }
}

module.exports = IgnorePlugin;