/**
 * 解析器工厂
 */
"use strict";

const { Tapable, HookMap, SyncHook, SyncWaterfallHook } = require("tapable");
const Factory = require("enhanced-resolve").ResolverFactory;
const { cachedCleverMerge } = require("./util/cleverMerge");


const EMTPY_RESOLVE_OPTIONS = {};

module.exports = class ResolverFactory extends Tapable {
	constructor() {
		super();
		this.hooks = {
			resolveOptions: new HookMap(
				() => new SyncWaterfallHook(["resolveOptions"])
			),
			resolver: new HookMap(() => new SyncHook(["resolver", "resolveOptions"]))
		};
		this._pluginCompat.tap("ResolverFactory", options => {
      // TODO
		});
    // 缓存
		this.cache2 = new Map();
	}

	// 根据类型和解析参数获取解析器
  get(type, resolveOptions) {
    resolveOptions = resolveOptions || EMTPY_RESOLVE_OPTIONS;
    const ident = `${type}|${JSON.stringify(resolveOptions)}`;
		// 如果缓存有解析器，则直接返回已缓存的解析器
    const resolver = this.cache2.get(ident);
    if (resolver) return resolver;
		const newResolver = this._create(type, resolveOptions);
		// 缓存新的解析器
		this.cache2.set(ident, newResolver);
		return newResolver;
  }

	// 根据类型和解析参数创建解析器
  _create(type, resolveOptions) {
		const originalResolveOptions = Object.assign({}, resolveOptions);
    // 触发hook - resolveOptions
		resolveOptions = this.hooks.resolveOptions.for(type).call(resolveOptions);
		// 创建解析器
		const resolver = Factory.createResolver(resolveOptions);
		if (!resolver) {
			throw new Error("No resolver created");
		}
		const childCache = new Map();
		resolver.withOptions = options => {
      // TODO
		};
    // 触发hook - resolver
		this.hooks.resolver.for(type).call(resolver, resolveOptions);
  }
}