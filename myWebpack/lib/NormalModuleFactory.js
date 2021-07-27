/**
 * 普通的模块工厂
 */
"use strict";

const path = require("path");
// Neo-Async 被认为是Async 的替代品，它几乎完全覆盖了它的功能并且运行得更快。
const asyncLib = require("neo-async");
const {
	Tapable,
	AsyncSeriesWaterfallHook,
	SyncWaterfallHook,
	SyncBailHook,
	SyncHook,
	HookMap
} = require("tapable");
const NormalModule = require("./NormalModule");
const RawModule = require("./RawModule");
const RuleSet = require("./RuleSet");
const { cachedCleverMerge } = require("./util/cleverMerge");

const EMPTY_RESOLVE_OPTIONS = {};

const MATCH_RESOURCE_REGEX = /^([^!]+)!=!/;

// 缓存依赖
const dependencyCache = new WeakMap();

class NormalModuleFactory extends Tapable {
  constructor(context, resolverFactory, options) {
    super();
		this.hooks = {
			resolver: new SyncWaterfallHook(["resolver"]),
			factory: new SyncWaterfallHook(["factory"]),
			beforeResolve: new AsyncSeriesWaterfallHook(["data"]),
			afterResolve: new AsyncSeriesWaterfallHook(["data"]),
			createModule: new SyncBailHook(["data"]),
			module: new SyncWaterfallHook(["module", "data"]),
			createParser: new HookMap(() => new SyncBailHook(["parserOptions"])),
			parser: new HookMap(() => new SyncHook(["parser", "parserOptions"])),
			createGenerator: new HookMap(
				() => new SyncBailHook(["generatorOptions"])
			),
			generator: new HookMap(
				() => new SyncHook(["generator", "generatorOptions"])
			)
		};
    // 注入hook - NormalModuleFactory
    this._pluginCompat.tap("NormalModuleFactory", options => {
      // TODO
    });
    this.resolverFactory = resolverFactory;
    this.ruleSet = new RuleSet(options.defaultRules.concat(options.rules));
    this.cachePredicate = 
      typeof options.unsafeCache === "function"
        ? options.unsafeCache
        : Boolean.bind(null, options.unsafeCache);
    this.context = context || "";
    this.parserCache = Object.create(null);
    this.generatorCache = Object.create(null);
    // 注入hook - NormalModuleFactory
    this.hooks.factory.tap("NormalModuleFactory", () => /* 直接返回一个函数，将作为下一个钩子的参数 */ (result, callback) => {
      // 触发hook - resolver
      let resolver = this.hooks.resolver.call(null);
      
			// 如果resolver注入的hook没有返回结果，则直接触发回调
			if (!resolver) return callback();

      // 触发resolver注入的hook执行的返回结果
      resolver(result, (err, data) => {
        if (err) return callback(err);

        if (!data) return callback();

				if (typeof data.source === "function") return callback(null, data);

        // 触发hook - afterResolve
        this.hooks.afterResolve.callAsync(data, (err, result) => {
          if (err) return callback(err);

					if (!result) return callback();
					let createdModule = this.hooks.createModule.call(result);
					if (!createdModule) {
						if (!result.request) {
							return callback(new Error("Empty dependency (no request)"));
						}

            // 创建模块
						createdModule = new NormalModule(result);
					}

					createdModule = this.hooks.module.call(createdModule, result);

					return callback(null, createdModule);
        })
      })
    });
    // 注入hook - NormalModuleFactory
    this.hooks.resolver.tap("NormalModuleFactory", () => /* 直接返回一个函数，将作为下一个钩子的参数 */ (data, callback) => {
      const contextInfo = data.contextInfo;
			const context = data.context;
			const request = data.request;

      // loader解析器
      const loaderResolver = this.getResolver("loader");
      // 标准解析器
			const normalResolver = this.getResolver("normal", data.resolveOptions);

      let matchResource = undefined;
			let requestWithoutMatchResource = request;
			const matchResourceMatch = MATCH_RESOURCE_REGEX.exec(request);
      if (matchResourceMatch) {
				// TODO
			}

			const noPreAutoLoaders = requestWithoutMatchResource.startsWith("-!");
			const noAutoLoaders =
				noPreAutoLoaders || requestWithoutMatchResource.startsWith("!");
      const noPrePostAutoLoaders = requestWithoutMatchResource.startsWith("!!");
      let elements = requestWithoutMatchResource
        .replace(/^-?!+/, "")
        .replace(/!!+/g, "!")
        .split("!");
      let resource = elements.pop();
      elements = elements.map(identToLoaderRequest);

      // e.g. 异步的 await
      asyncLib.parallel(
        [
          callback => 
            this.resolveRequestArray(
              contextInfo,
              context,
              elements,
              loaderResolver,
              callback
            ),
          callback => {
            if (resource === "" || resource[0] === "?") {
              // TODO
            }

            normalResolver.resolve(
              contextInfo,
              context,
              resource,
              {},
              (err, resource, resourceResolveData) => {
                if (err) return callback(err);
                callback(null, {
                  resourceResolveData,
                  resource
                });
              }
            );
          }
        ],
        // 处理完上面task队列的回调
        (err, results) => {
          if (err) return callback(err);
          let loaders = results[0];
          const resourceResolveData = results[1].resourceResolveData;
          resource = results[1].resource;

          try {
            for (const item of loaders) {
              if (typeof item.options === "string" && item.options[0] === "?")  {
                // TODO
              }
            }
          } catch (e) {
            return callback(e);
          }

          if (resource === false) {
            // TODO
          }

          const userRequest = 
            (matchResource !== undefined ? `${matchResource}!=!` : "")
            .loaders
              .map(loaderToIdent)
              .concat([resource])
              .join("!");
          
          let resourcePath =
            matchResource !== undefined ? matchResource : resource;
          let resourceQuery = "";
          const queryIndex = resourcePath.indexOf("?");
          if (queryIndex >= 0) {
            // TODO
          }

          const result = this.ruleSet.exec({
            resource: resourcePath,
            realResource:
              matchResource !== undefined
                ? resource.replace(/\?.*/, "")
                : resourcePath,
            resourceQuery,
            issuer: contextInfo.issuer,
            compiler: contextInfo.compiler
          });
          const settings = {};
          const useLoadersPost = [];
          const useLoaders = [];
          for (const r of result) {
            if (r.type === "use") {
              // TODO
            } else if (
              typeof r.value === "object" &&
              r.value !== null &&
              typeof settings[r.type] === "object" &&
              settings[r.type] !== null
            ) {
              // TODO
            } else {
              settings[r.type] = r.value;
            }
          }

          asyncLib.parallel(
            [
              this.resolveRequestArray.bind(
                this,
                contextInfo,
                this.context,
                useLoadersPost,
                loaderResolver
              ),
							this.resolveRequestArray.bind(
								this,
								contextInfo,
								this.context,
								useLoaders,
								loaderResolver
							),
							this.resolveRequestArray.bind(
								this,
								contextInfo,
								this.context,
								useLoadersPre,
								loaderResolver
							)
            ],
            (err, results) => {
              if (err) return callback(err);
              if (matchResource === undefined) {
                loaders = results[0].concat(loaders, results[1], results[2]);
              } else {
                // TODO
              }

              process.nextTick(() => {
                const type = settings.type;
                const resolveOptions = settings.resolve;
                callback(null, {
									context: context,
									request: loaders
										.map(loaderToIdent)
										.concat([resource])
										.join("!"),
									dependencies: data.dependencies,
									userRequest,
									rawRequest: request,
									loaders,
									resource,
									matchResource,
									resourceResolveData,
									settings,
									type,
									parser: this.getParser(type, settings.parser), // Parser.js，用来解析源文件内容
									generator: this.getGenerator(type, settings.generator),
									resolveOptions
                })
              })
            }
          )
        }
      )
    })
  }

  // 创建
  create(data, callback) {
    const dependencies = data.dependencies;
    // 如果有缓存的依赖，直接触发回调
		const cacheEntry = dependencyCache.get(dependencies[0]);
		if (cacheEntry) return callback(null, cacheEntry);
    // 上下文：当前项目根路径
		const context = data.context || this.context;
    // 解析参数，默认为空对象
		const resolveOptions = data.resolveOptions || EMPTY_RESOLVE_OPTIONS;
    // 依赖请求路径
		const request = dependencies[0].request;
		const contextInfo = data.contextInfo || {};
    // 触发hook - beforeResolve
    this.hooks.beforeResolve.callAsync(
			{
				contextInfo,
				resolveOptions,
				context,
				request,
				dependencies
			},
      (err, result) => {
				if (err) return callback(err);

        // result默认为beforeResolve.callAsync执行的第一个参数
				if (!result) return callback();

        // 触发hook - factory
				const factory = this.hooks.factory.call(null);
        
				// Ignored
				if (!factory) return callback();

        // 触发hook - NormalModuleFactory返回的函数
				factory(result, (err, module) => {
          // callback
          if (err) return callback(err);
          
          if (module && this.cachePredicate(module)) {
            // 缓存断言 TODO
            for (const d of dependencies) {
              dependencyCache.set(d, module);
            }
          }

          callback(null, module);
				});
      }
    )
  }

  resolveRequestArray(contextInfo, context, array, resolver, callback) {
    if (array.length === 0) return callback(null, []);
    // TODO
  }

  // 获取处理器
  getParser(type, parserOptions) {
    let ident = type;
    if (parserOptions) {
      // TODO
    }
    if (ident in this.parserCache) {
      return this.parserCache[ident];
    }
    return (this.parserCache[ident] = this.createParser(type, parserOptions));
  }

  // 创建处理器
  createParser(type, parserOptions = {}) {
    // 触发hook - createParser
    const parser = this.hooks.createParser.for(type).call(parserOptions);
    if (!parser) {
      throw new Error(`No parser registered for ${type}`);
    }
    // 触发hook - parser
    // e.g. 执行DefinePlugin中注入了parser hook
    this.hooks.parser.for(type).call(parser, parserOptions);
    return parser;
  }

  // 获取构造器
  getGenerator(type, generatorOptions) {
    let ident = type;
    if (generatorOptions) {
      // TODO
    }
    if (ident in this.generatorCache) {
      return this.generatorCache[ident];
    }
    return (this.generatorCache[ident] = this.createGenerator(
      type,
      generatorOptions
    ));
  }

  // 创建构造器
  createGenerator(type, generatorOptions = {}) {
    const generator = this.hooks.createGenerator
      .for(type)
      .call(generatorOptions)
    if (!generator) {
			throw new Error(`No generator registered for ${type}`);
		}
		this.hooks.generator.for(type).call(generator, generatorOptions);
		return generator;
  }

  // 获取解析器
  getResolver(type, resolveOptions) {
    return this.resolverFactory.get(
      type,
      resolveOptions || EMPTY_RESOLVE_OPTIONS
    );
  }
}
module.exports = NormalModuleFactory;
