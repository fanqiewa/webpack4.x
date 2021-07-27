/**
 * 预取出普通的模块请求(module request)，可以让这些模块在他们被 import 或者是 require 之前就解析并且编译。使用这个预取插件可以提升性能。
 * 可以多试试在编译前记录时间(profile)来决定最佳的预取的节点。
 */
"use strict";
const PrefetchDependency = require("./dependencies/PrefetchDependency");

// e.g. new webpack.PrefetchPlugin([context], request)
class PrefetchPlugin {
	constructor(context, request) {
		if (!request) {
			this.request = context;
		} else {
			this.context = context;
			this.request = request;
		}
	}

	apply(compiler) {
		compiler.hooks.compilation.tap(
			"PrefetchPlugin",
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					PrefetchDependency,
					normalModuleFactory
				);
			}
		);
		compiler.hooks.make.tapAsync("PrefetchPlugin", (compilation, callback) => {
			compilation.prefetch(
				this.context || compiler.context,
				new PrefetchDependency(this.request),
				callback
			);
		});
	}
}
module.exports = PrefetchPlugin;