
"use strict";

const asyncLib = require("neo-async");
const util = require("util");
const { CachedSource } = require("webpack-sources");
const {
	Tapable,
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	AsyncSeriesHook
} = require("tapable");
const EntryModuleNotFoundError = require("./EntryModuleNotFoundError");
const ModuleNotFoundError = require("./ModuleNotFoundError");
const ModuleDependencyWarning = require("./ModuleDependencyWarning");
const ModuleDependencyError = require("./ModuleDependencyError");
const ChunkGroup = require("./ChunkGroup");
const Chunk = require("./Chunk");
const Entrypoint = require("./Entrypoint");
const MainTemplate = require("./MainTemplate");
const ChunkTemplate = require("./ChunkTemplate");
const HotUpdateChunkTemplate = require("./HotUpdateChunkTemplate");
const ModuleTemplate = require("./ModuleTemplate");
const RuntimeTemplate = require("./RuntimeTemplate");
const ChunkRenderError = require("./ChunkRenderError");
const Stats = require("./Stats");
const Semaphore = require("./util/Semaphore");
const createHash = require("./util/createHash");
const SortableSet = require("./util/SortableSet");
const GraphHelpers = require("./GraphHelpers");
const ModuleDependency = require("./dependencies/ModuleDependency");
const compareLocations = require("./compareLocations");
const { Logger, LogType } = require("./logging/Logger");
const ErrorHelpers = require("./ErrorHelpers");
const buildChunkGraph = require("./buildChunkGraph");
const WebpackError = require("./WebpackError");

// 迭代可变的
const iterationBlockVariable = (variables, fn) => {
	for (
		let indexVariable = 0;
		indexVariable < variables.length;
		indexVariable++
	) {
		const varDep = variables[indexVariable].dependencies;
		for (let indexVDep = 0; indexVDep < varDep.length; indexVDep++) {
			fn(varDep[indexVDep]);
		}
	}

}

// 迭代数组，执行回调
const iterationOfArrayCallback = (arr, fn) => {
	for (let index = 0; index < arr.length; index++) {
		fn(arr[index]);
	}
}
const byIdOrIdentifier = (a, b) => {
	if (typeof a.id !== typeof b.id) {
		return typeof a.id < typeof b.id ? -1 : 1;
	}
	if (a.id < b.id) return -1;
	if (a.id > b.id) return 1;
	const identA = a.identifier();
	const identB = b.identifier();
	if (identA < identB) return -1;
	if (identA > identB) return 1;
	return 0;
};

// 排序规则
const byIndexOrIdentifier = (a, b) => {
	if (a.index < b.index) return -1;
	if (a.index > b.index) return 1;
	const identA = a.identifier();
	const identB = b.identifier();
	if (identA < identB) return -1;
	if (identA > identB) return 1;
	return 0;
}

class Compilation extends Tapable {
  constructor(compiler) {
    super();
    this.hooks = {
			buildModule: new SyncHook(["module"]),
			rebuildModule: new SyncHook(["module"]),
			failedModule: new SyncHook(["module", "error"]),
			succeedModule: new SyncHook(["module"]),
			addEntry: new SyncHook(["entry", "name"]),
			failedEntry: new SyncHook(["entry", "name", "error"]),
			succeedEntry: new SyncHook(["entry", "name", "module"]),
      dependencyReference: new SyncWaterfallHook([
				"dependencyReference",
				"dependency",
				"module"
			]),
			finishModules: new AsyncSeriesHook(["modules"]),
			finishRebuildingModule: new SyncHook(["module"]),
			unseal: new SyncHook([]),
			seal: new SyncHook([]),
			beforeChunks: new SyncHook([]),
			afterChunks: new SyncHook(["chunks"]),
			optimizeDependenciesBasic: new SyncBailHook(["modules"]),
			optimizeDependencies: new SyncBailHook(["modules"]),
			optimizeDependenciesAdvanced: new SyncBailHook(["modules"]),
			afterOptimizeDependencies: new SyncHook(["modules"]),
			optimize: new SyncHook([]),
			optimizeModulesBasic: new SyncBailHook(["modules"]),
			optimizeModules: new SyncBailHook(["modules"]),
			optimizeModulesAdvanced: new SyncBailHook(["modules"]),
			afterOptimizeModules: new SyncHook(["modules"]),
			optimizeChunksBasic: new SyncBailHook(["chunks", "chunkGroups"]),
			optimizeChunks: new SyncBailHook(["chunks", "chunkGroups"]),
			optimizeChunksAdvanced: new SyncBailHook(["chunks", "chunkGroups"]),
			afterOptimizeChunks: new SyncHook(["chunks", "chunkGroups"]),
			optimizeTree: new AsyncSeriesHook(["chunks", "modules"]),
			afterOptimizeTree: new SyncHook(["chunks", "modules"]),
			optimizeChunkModulesBasic: new SyncBailHook(["chunks", "modules"]),
			optimizeChunkModules: new SyncBailHook(["chunks", "modules"]),
			optimizeChunkModulesAdvanced: new SyncBailHook(["chunks", "modules"]),
			afterOptimizeChunkModules: new SyncHook(["chunks", "modules"]),
			shouldRecord: new SyncBailHook([]),
			reviveModules: new SyncHook(["modules", "records"]),
			optimizeModuleOrder: new SyncHook(["modules"]),
			advancedOptimizeModuleOrder: new SyncHook(["modules"]),
			beforeModuleIds: new SyncHook(["modules"]),
			moduleIds: new SyncHook(["modules"]),
			optimizeModuleIds: new SyncHook(["modules"]),
			afterOptimizeModuleIds: new SyncHook(["modules"]),
			reviveChunks: new SyncHook(["chunks", "records"]),
			optimizeChunkOrder: new SyncHook(["chunks"]),
			beforeChunkIds: new SyncHook(["chunks"]),
			optimizeChunkIds: new SyncHook(["chunks"]),
			afterOptimizeChunkIds: new SyncHook(["chunks"]),
			recordModules: new SyncHook(["modules", "records"]),
			recordChunks: new SyncHook(["chunks", "records"]),
			beforeHash: new SyncHook([]),
			contentHash: new SyncHook(["chunk"]),
			afterHash: new SyncHook([]),
			recordHash: new SyncHook(["records"]),
			record: new SyncHook(["compilation", "records"]),
			beforeModuleAssets: new SyncHook([]),
			shouldGenerateChunkAssets: new SyncBailHook([]),
			beforeChunkAssets: new SyncHook([]),
			additionalChunkAssets: new SyncHook(["chunks"]),
			additionalAssets: new AsyncSeriesHook([]),
			optimizeChunkAssets: new AsyncSeriesHook(["chunks"]),
			afterOptimizeChunkAssets: new SyncHook(["chunks"]),
			optimizeAssets: new AsyncSeriesHook(["assets"]),
			afterOptimizeAssets: new SyncHook(["assets"]),
			needAdditionalSeal: new SyncBailHook([]),
			afterSeal: new AsyncSeriesHook([]),
			chunkHash: new SyncHook(["chunk", "chunkHash"]),
			moduleAsset: new SyncHook(["module", "filename"]),
			chunkAsset: new SyncHook(["chunk", "filename"]),
			assetPath: new SyncWaterfallHook(["filename", "data"]), // TODO MainTemplate
			needAdditionalPass: new SyncBailHook([]),
			childCompiler: new SyncHook([
				"childCompiler",
				"compilerName",
				"compilerIndex"
			]),
			log: new SyncBailHook(["origin", "logEntry"]),
			normalModuleLoader: new SyncHook(["loaderContext", "module"]),
			optimizeExtractedChunksBasic: new SyncBailHook(["chunks"]),
			optimizeExtractedChunks: new SyncBailHook(["chunks"]),
			optimizeExtractedChunksAdvanced: new SyncBailHook(["chunks"]),
			afterOptimizeExtractedChunks: new SyncHook(["chunks"])
		};
    // 注入hook - Compilation
    this._pluginCompat("Compilation", options => {
      // TODO
    });
    this.name = undefined;
    this.compiler = compiler;
    this.resolverFactory = compiler.resolverFactory;
    this.inputFileSystem = compiler.inputFileSystem;
    
    const options = compiler.options;
    this.options = options;
    this.outputOptions = options && options.output;
    this.bail = options && options.bail;
    this.profile = options && options.profile;
    this.performance = options && options.performance;

    this.mainTemplate = new MainTemplate(this.outputOptions);
		this.chunkTemplate = new ChunkTemplate(this.outputOptions);
		this.hotUpdateChunkTemplate = new HotUpdateChunkTemplate(
			this.outputOptions
		);
		this.runtimeTemplate = new RuntimeTemplate(
			this.outputOptions,
			this.requestShortener
		);
		this.moduleTemplates = {
			javascript: new ModuleTemplate(this.runtimeTemplate, "javascript"),
			webassembly: new ModuleTemplate(this.runtimeTemplate, "webassembly")
		};
    // 信号量
		this.semaphore = new Semaphore(options.parallelism || 100);

		this.entries = [];
		this._preparedEntrypoints = [];
		this.entrypoints = new Map();
		this.chunks = [];
		this.chunkGroups = [];
		this.namedChunkGroups = new Map();
		this.namedChunks = new Map();
		this.modules = [];
		this._modules = new Map();
		this.cache = null;
		this.records = null;
		this.additionalChunkAssets = [];
		this.assets = {};
		this.assetsInfo = new Map();
		this.errors = [];
		this.warnings = [];
		this.children = [];
		this.logging = new Map();
		this.dependencyFactories = new Map();
		this.dependencyTemplates = new Map();
		this.dependencyTemplates.set("hash", "");
		this.childrenCounters = {};
		this.usedChunkIds = null;
		this.usedModuleIds = null;
		this.fileTimestamps = undefined;
		this.contextTimestamps = undefined;
		this.compilationDependencies = undefined;
		this._buildingModules = new Map();
		this._rebuildingModules = new Map();
		this.emittedAssets = new Set();
  }

	getStats() {
		return new Stats(this);
	}
	// 获取Log
	getLogger(name) {
		if (!name) {
			throw new TypeError("Compilation.getLogger(name) called without a name");
		}
		let logEntries;
		return new Logger((type, args) => {
			if (typeof name === "function") {
				name = name();
				if (!name) {
					throw new TypeError(
						"Compilation.getLogger(name) called with a function not returning a name"
					);
				}
			}
			let trace;
			switch (type) {
				case LogType.warn:
				case LogType.error:
				case LogType.trace:
					trace = ErrorHelpers.cutOffLoaderExecution(new Error("Trace").stack)
						.split("\n")
						.slice(3);
					break;
			}
			const logEntry = {
				time: Date.now(),
				type,
				args,
				trace
			};
			if (this.hooks.log.call(name, logEntry) === undefined) {
				if (logEntry.type === LogType.profileEnd) {
					// TODO
				}
				if (logEntries === undefined) {
					logEntries = this.logging.get(name);
					if (logEntries === undefined) {
						logEntries = [];
						this.logging.set(name, logEntries);
					}
				}
				logEntries.push(logEntry);
				if (logEntry.type === LogType.profile) {
					// TODO
				}
			}
		})
	}

	// 添加模块
	addModule(module, cacheGroup) {
		const identifier = module.identifier();
		const alreadyAddedModule = this._modules.get(identifier);
		if (alreadyAddedModule) {
			// TODO
		}
		const cacheName = (cacheGroup || "m") + identifier;
		if (this.cache && this.cache[cacheName]) {
			// TODO
		}
		this._modules.set(identifier, module);
		if (this.cache) {
			// TODO
		}
		this.module.push(module);
		return {
			module: module,
			issuer: true,
			build: true,
			dependencies: true
		}
	}

	// 等待build完成
	waitForBuildingFinished(module, callback) {
		let callbackList = this._buildingModules.get(module);
		if (callbackList) {
			callbackList.push(() => callback());
		} else {
			process.nextTick(callback);
		}
	}

	// build 模块
	buildModule(module, optional, origin, dependencies, thisCallback) {
		let callbackList = this._buildingModules.get(module);
		if (callbackList) {
			callbackList.push(thisCallback);
			return;
		}
		this._buildingModules.set(module, (callbackList = [thisCallback]));

		const callback = err => {
			this._buildingModules.delete(module);
			for(const cb of callbackList) {
				cb(err);
			}
		}

		this.hooks.buildModule.call(module);
		module.build(
			this.options,
			this,
			this.resolverFactory.get("normal", module.resolveOptions),
			this.inputFileSystem,
			error => {
				const errors = module.errors;
				for (let indexError = 0; indexError < errors.length; indexError++) {
					const err = errors[indexError];
					err.origin = origin;
					err.dependencies = dependencies;
					if (optional) {
						this.warnings.push(err);
					} else {
						this.errors.push(err);
					}
				}

				const warning = module.warnings;
				for (let indexWarning = 0; indexWarning < warning.length; indexWarning++) {
					const war = warnings[indexWarning];
					war.origin = origin;
					war.dependencies = dependencies;
					this.warnings.push(war);
				}
				const originalMap = module.dependencies.reduce((map, v, i) => {
					map.set(v, i);
					return map;
				}, new Map());
				module.dependencies.sort((a, b) => {
					const cmp = compareLocations(a.loc, b.loc);
					if (cmp) return cmp;
					return originalMap.get(a) - originalMap.get(b);
				});
				if (error) {
					this.hooks.failedModule.call(module, error);
					return callback(error);
				}
				this.hooks.succeedModule.call(module);
				return callback();
			}
		)
	}

	// 处理模块目录
	processModuleDependencies(module, callback) {
		const dependencies = new Map();

		// 添加单个依赖
		const addDependency = dep => {
			const resourceIdent = dep.getResourceIdentifier();
			if (resourceIdent) {
				const factory = this.dependencyFactories.get(dep.constructor);
				if (factory === undefined) {
					throw new Error(
						`No module factory available for dependency type: ${dep.constructor.name}`
					);
				}
				let innerMap = dependencies.get(factory);
				if (innerMap === undefined) {
					dependencies.set(factory, (innerMap = new Map()));
				}
				let list = innerMap.get(resourceIdent);
				if (list === undefined) innerMap.set(resourceIdent, (list = []));
				list.push(dep);
			}
		}
		// 添加多个依赖
		const addDependenciesBlock = block => {
			if (block.dependencies) {
				iterationOfArrayCallback(block.dependencies, addDependency);
			}
			if (block.blocks) {
				iterationOfArrayCallback(block.blocks, addDependenciesBlock);
			}
			if (block.variables) {
				iterationBlockVariable(block.variables, addDependency);
			}
		}

		try {
			addDependenciesBlock(module);
		} catch (e) {
			callback(e);
		}

		const sortedDependencies = [];

		for (const pair1 of dependencies) {
			for (const pair2 of pair1[1]) {
				sortedDependencies.push({
					factory: pair1[0],
					dependencies: pair2[1]
				});
			}
		}

		this.addModuleDependencies(
			module,
			sortedDependencies,
			this.bail,
			null,
			true,
			callback
		);
	}

	// 添加导入的模块依赖
	addModuleDependencies(
		module,
		dependencies,
		bail,
		cacheGroup,
		recursive,
		callback
	) {
		const start = this.profile && Date.now();
		const currentProfile = this.profile && {};

		// 遍历dependencies数组，执行回调
		asyncLib.forEach(
			dependencies,
			(item, callback) => {
				// 依赖数组
				const dependencies = item.dependencies;

				// 错误处理和执行回调
				const errorAndCallback = err => {
					err.origin = module;
					err.dependencies = dependencies;
					this.errors.push(err);
					if (bail) {
						callback(err);
					} else {
						callback();
					}
				};
				// 警告处理和执行回调
				const warningAndCallback = err => {
					err.origin = module;
					this.warnings.push(err);
					callback();
				};

				const semaphore = this.semaphore;
				semaphore.acquire(() => {
					const factory = item.factory;
					factory.create(
						{
							contextInfo: {
								issuer: module.nameForCondition && module.nameForCondition(),
								compiler: this.compiler.name
							},
							resolveOptions: module.resolveOptions,
							context: module.context,
							dependencies: dependencies
						},
						(err, dependentModule) => {
							let afterFactory;

							const isOptional = () => {
								// optional => 可选择的
								return dependencies.every(d => d.optional);
							};

							// 执行错误或警告方法并处罚回调
							const errorOrWarningAndCallback = err => {
								if (isOptional()) {
									return warningAndCallback(err);
								} else {
									return errorAndCallback(err);
								}
							};

							if (err) {
								// 减少信号量，并触发错误方法
								semaphore.release();
								return errorOrWarningAndCallback(
									new ModuleNotFoundError(module, err)
								);
							}
							if (!dependentModule) {
								semaphore.release();
								// 添加回调到微任务中
								return process.nextTick(callback);
							}
							if (currentProfile) {
								afterFactory = Date.now();
								currentProfile.factory = afterFactory - start;
							}

							// 迭代依赖，添加原因
							const iterationDependencies = depend => {
								for (let index = 0; index < depend.length; index++) {
									const dep = depend[index];
									dep.module = dependentModule;
									dependentModule.addReason(module, dep);
								}
							};

							// 添加模块
							const addModuleResult = this.addModule(
								dependentModule,
								cacheGroup
							);
							dependentModule = addModuleResult.module;
							iterationDependencies(dependencies);
							
							// build的后置回调
							const afterBuild = () => {
								if (recursive && addModuleResult.dependencies) {
									this.processModuleDependencies(dependentModule, callback);
								} else {
									return callback();
								}
							};

							if (addModuleResult.issuer) {
								if (currentProfile) {
									dependentModule.profile = currentProfile;
								}

								dependentModule.issuer = module;
							} else {
								if (this.profile) {
									if (module.profile) {
										const time = Date.now() - start;
										if (
											!module.profile.dependencies ||
											time > module.profile.dependencies
										) {
											module.profile.dependencies = time;
										}
									}
								}
							}

							if (addModuleResult.build) {
								// 构建模块
								this.buildModule(
									dependentModule,
									isOptional(),
									module,
									dependencies,
									err => {
										// 错误处理
										if (err) {
											semaphore.release();
											return errorOrWarningAndCallback(err);
										}

										if (currentProfile) {
											const afterBuilding = Date.now();
											currentProfile.building = afterBuilding - afterFactory;
										}

										semaphore.release();
										afterBuild();
									}
								);
							} else {
								semaphore.release();
								this.waitForBuildingFinished(dependentModule, afterBuild);
							}
						}
					);
				});
			},
			err => { // dependencies为空数组时，执行此回调
				if (err) {
					err.stack = err.stack;
					return callback(err);
				}

				return process.nextTick(callback);
			}
		);
	}

	// 添加入口
	addEntry(context, entry, name, callback) {
		// 触发hook - addEntry
		this.hooks.addEntry.call(entry, name);

		const slot = {
			name: name,
			request: null,
			module: null
		};

		if (entry instanceof ModuleDependency) {
			slot.request = entry.request;
		}

		const idx = this._preparedEntrypoints.findIndex(slot => slot.name === name);
		if (idx >= 0) {
			// 重置入口点
			this._preparedEntrypoints[idx] = slot;
		} else {
			// 添加入口点
			this._preparedEntrypoints.push(slot);
		}
		this._addModuleChain(
			context,
			entry,
			module => {
				this.entries.push(module);
			},
			(err, module) => {
				// 添加模块完的回调函数
				if (err) {
					this.hooks.failedEntry.call(entry, name, err);
					return callback(err);
				}

				if (module) {
					slot.module = module;
				} else {
					const idx = this._preparedEntrypoints.indexOf(slot);
					if (idx >= 0) {
						// 移除入口点
						this._preparedEntrypoints.splice(idx, 1);
					}
				}
				this.hooks.succeedEntry.call(entry, name, module);
				// 触发this.hooks.make的回调
				return callback(null, module);
			}
		)
	}

	// 添加模块链
	_addModuleChain(context, dependency, onModule, callback) {
		// 开始时间
		const start = this.profile && Date.now();
		// profile档案
		const currentProfile = this.profile && {};

		// 添加错误并触发回调函数
		const errorAndCallback = this.bail
			? err => {
					callback(err);
			  }
			: err => {
					err.dependencies = [dependency];
					this.errors.push(err);
					callback();
			  };

		if (
			typeof dependency !== "object" ||
			dependency === null ||
			!dependency.constructor
		) {
			throw new Error("Parameter 'dependency' must be a Dependency");
		}
		// 依赖构造器
		const Dep = (dependency.constructor);
		const moduleFactory = this.dependencyFactories.get(Dep);
		if (!moduleFactory) {
			throw new Error(
				`No dependency factory available for this dependency type: ${dependency.constructor.name}`
			);
		}

		this.semaphore.acquire(() => {
			// 如果信号量大于0，则触发该回调
			moduleFactory.create(
				// data
				{
					contextInfo: {
						issuer: "", // 发行者
						compiler: this.compiler.name // 编译器
					},
					context: context,
					dependencies: [dependency]
				},
				// callback
				(err, module) => {
					// callback
					if (err) {
						this.semaphore.release();
						return errorAndCallback(new EntryModuleNotFoundError(err));
					}

					let afterFactory;

					if (currentProfile) {
						afterFactory = Date.now();
						currentProfile.factory = afterFactory - start;
					}

					const addModuleResult = this.addModule(module);
					module = addModuleResult.module;

					onModule(module);

					dependency.module = module;
					module.addReason(null, dependency);

					// build的后置回调
					const afterBuild = () => {
						if (addModuleResult.dependencies) {
							this.processModuleDependencies(module, err => {
								if (err) return callback(err);
								callback(null, module);
							});
						} else {
							return callback(null, module);
						}
					}

					if (addModuleResult.issuer) {
						if (currentProfile) {
							module.profile = currentProfile;
						}
					}

					if (addModuleResult.build) {
						// 开始打包
						this.buildModule(module, false, null, null, err => {
							// 错误处理
							if (err) {
								this.semaphore.release();
								return errorAndCallback(err);
							}
							if (currentProfile) {
								const afterBuilding = Date.now();
								currentProfile.building = afterBuilding - afterFactory;
							}

							this.semaphore.release();
							afterBuild();
						})
					} else {
						this.semaphore.release();
						this.waitForBuildingFinished(module, afterBuild);
					}
				}
			)
		})
	}

	// 排序
	sortModules(modules) {
		modules.sort(byIndexOrIdentifier);
	}

	// 转到依赖错误和警告处理
	reportDependencyErrorsAndWarnings(module, blocks) {
		for (let indexBlock = 0; indexBlock < blocks.length; indexBlock++) {
			const block = blocks[indexBlock];
			const dependencies = block.dependencies;

			for (let indexDep = 0; indexDep < dependencies.length; indexDep++) {
				const d = dependencies[indexDep];

				const warnings = d.getWarnings();
				if (warnings) {
					for (let indexWar = 0; indexWar < warnings.length; indexWar++) {
						const w = warnings[indexWar];

						const warning = new ModuleDependencyWarning(module, w, d.loc);
						this.warnings.push(warning);
					}
				}
				const errors = d.getErrors();
				if (errors) {
					for (let indexErr = 0; indexErr < errors.length; indexErr++) {
						const e = errors[indexErr];

						const error = new ModuleDependencyError(module, e, d.loc);
						this.errors.push(error);
					}
				}
			}
			this.reportDependencyErrorsAndWarnings(module, block.blocks);
		}
	}

	// 完成resolve
	finish(callback) {
		const modules = this.modules;
		// 触发hook - finishModules
		this.hooks.finishModules.callAsync(modules, err => {
			if (err) return callback(err);

			for (let index = 0; index < this.modules.length; index++) {
				const module = modules[index];
				this.reportDependencyErrorsAndWarnings(module, [module]);
			}

			callback();
		})
	}

	// 闭环
	seal(callback) {
		this.hooks.seal.call();

		// 触发hook - optimizeDependenciesBasic、optimizeDependencies、optimizeDependenciesAdvanced
		while (
			// 不存在hooks
			this.hooks.optimizeDependenciesBasic.call(this.modules) ||
			// 存在hooks
			this.hooks.optimizeDependencies.call(this.modules) ||
			// 不存在hooks
			this.hooks.optimizeDependenciesAdvanced.call(this.modules)
		) {
			/* empty */
		}

		this.hooks.afterOptimizeDependencies.call(this.modules);
		// 触发hook - beforeChunks
		this.hooks.beforeChunks.call();
		for (const preparedEntrypoint of this._preparedEntrypoints) {
			const module = preparedEntrypoint.module;
			const name = preparedEntrypoint.name;
			// 添加chunk
			const chunk = this.addChunk(name);
			const entrypoint = new Entrypoint(name);
			entrypoint.setRuntimeChunk(chunk);
			entrypoint.addOrigin(null, name, preparedEntrypoint.request);
			this.namedChunkGroups.set(name, entrypoint);
			this.entrypoints.set(name, entrypoint);
			this.chunkGroups.push(entrypoint);
			
			GraphHelpers.connectChunkGroupAndChunk(entrypoint, chunk);
			GraphHelpers.connectChunkAndModule(chunk, module);
			
			chunk.entryModule = module;
			chunk.name = name;

			this.assignDepth(module);
		}
		// 构建chunk图
		buildChunkGraph(this, (this.chunkGroups.slice()));

		this.sortModules(this.module);
		// 触发hook -afterChunks
		this.hooks.afterChunks.call(this.chunks);

		// 触发hook - optimize
		this.hooks.optimize.call();

		while (
			// 不存在
			this.hooks.optimizeModulesBasic.call(this.modules) ||
			// 不存在
			this.hooks.optimizeModules.call(this.modules) ||
			// 不存在
			this.hooks.optimizeModulesAdvanced.call(this.modules)
		) {
			/* empty */
		}
		// 触发hook - afterOptimizeModules
		this.hooks.afterOptimizeModules.call(this.modules);
		
		while (
			// 存在
			this.hooks.optimizeChunksBasic.call(this.chunks, this.chunkGroups) ||
			// 不存在
			this.hooks.optimizeChunks.call(this.chunks, this.chunkGroups) ||
			// 存在
			this.hooks.optimizeChunksAdvanced.call(this.chunks, this.chunkGroups)
		) {
			/* empty */
		}
		// 不存在
		this.hooks.afterOptimizeChunks.call(this.chunks, this.chunkGroups);

		this.hooks.optimizeTree.callAsync(this.chunks, this.modules, err => {
			if (err) {
				return callback(err);
			}
			// 不存在
			this.hooks.afterOptimizeTree.call(this.chunks, this.modules);

			while (
				// 不存在
				this.hooks.optimizeChunkModulesBasic.call(this.chunks, this.modules) ||
				this.hooks.optimizeChunkModules.call(this.chunks, this.modules) ||
				// 不存在
				this.hooks.optimizeChunkModulesAdvanced.call(this.chunks, this.modules)
			) {
				/* empty */
			}
			this.hooks.afterOptimizeChunkModules.call(this.chunks, this.modules);

			const shouldRecord = this.hooks.shouldRecord.call() !== false;

			this.hooks.reviveModules.call(this.modules, this.records);
			this.hooks.optimizeModuleOrder.call(this.modules);
			this.hooks.advancedOptimizeModuleOrder.call(this.modules);
			this.hooks.beforeModuleIds.call(this.modules);
			this.hooks.moduleIds.call(this.modules);
			this.applyModuleIds();
			this.hooks.optimizeModuleIds.call(this.modules);
			this.hooks.afterOptimizeModuleIds.call(this.modules);

			this.sortItemsWithModuleIds();

			this.hooks.reviveChunks.call(this.chunks, this.records);
			this.hooks.optimizeChunkOrder.call(this.chunks);
			this.hooks.beforeChunkIds.call(this.chunks);
			this.applyChunkIds();
			this.hooks.optimizeChunkIds.call(this.chunks);
			this.hooks.afterOptimizeChunkIds.call(this.chunks);

			this.sortItemsWithChunkIds();

			if (shouldRecord) {
				this.hooks.recordModules.call(this.modules, this.records);
				this.hooks.recordChunks.call(this.chunks, this.records);
			}

			this.hooks.beforeHash.call();
			this.createHash();
			this.hooks.afterHash.call();

			if (shouldRecord) {
				this.hooks.recordHash.call(this.records);
			}

			this.hooks.beforeModuleAssets.call();
			this.createModuleAssets();
			if (this.hooks.shouldGenerateChunkAssets.call() !== false) {
				this.hooks.beforeChunkAssets.call();
				this.createChunkAssets();
			}
			this.hooks.additionalChunkAssets.call(this.chunks);
			this.summarizeDependencies();
			if (shouldRecord) {
				this.hooks.record.call(this, this.records);
			}

			this.hooks.additionalAssets.callAsync(err => {
				if (err) {
					return callback(err);
				}
				this.hooks.optimizeChunkAssets.callAsync(this.chunks, err => {
					if (err) {
						return callback(err);
					}
					this.hooks.afterOptimizeChunkAssets.call(this.chunks);
					this.hooks.optimizeAssets.callAsync(this.assets, err => {
						if (err) {
							return callback(err);
						}
						this.hooks.afterOptimizeAssets.call(this.assets);
						if (this.hooks.needAdditionalSeal.call()) {
							this.unseal();
							return this.seal(callback);
						}
						return this.hooks.afterSeal.callAsync(callback);
					});
				});
			});
		});
	}

	applyModuleIds() {
		const unusedIds = [];
		let nextFreeModuleId = 0;
		const usedIds = new Set();
		if (this.usedModuleIds) {
			// TODO
		}

		const modules1 = this.modules;
		for (let indexModule1 = 0; indexModule1 < modules1.length; indexModule1++) {
			const module1 = modules1[indexModule1];
			if (module1.id !== null) {
				usedIds.add(module1.id);
			}
		}

		if (usedIds.size > 0) {
			// TODO
		}

		const modules2 = this.modules;
		for (let indexModule2 = 0; indexModule2 < modules2.length; indexModule2++) {
			const module2 = modules2[indexModule2];
			if (module2.id === null) {
				if (unusedIds.length > 0) {
					module2.id = unusedIds.pop();
				} else {
					module2.id = nextFreeModuleId++;
				}
			}
		}
	}

	sortItemsWithModuleIds() {
		this.modules.sort(byIdOrIdentifier);

		const modules = this.modules;
		for (let indexModule = 0; indexModule < modules.length; indexModule++) {
			modules[indexModule].sortItems(false);
		}

		const chunks = this.chunks;
		for (let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			chunks[indexChunk].sortItems();
		}

		chunks.sort((a, b) => a.compareTo(b));
	}

	applyChunkIds() {
		const usedIds = new Set();
		if (this.usedChunkIds) {
			for (const id of this.usedChunkIds) {
				if (typeof id !== "number") {
					continue;
				}

				usedIds.add(id);
			}
		}

		const chunks = this.chunks;
		for (let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			const chunk = chunks[indexChunk];
			const usedIdValue = chunk.id;

			if (typeof usedIdValue !== "number") {
				continue;
			}

			usedIds.add(usedIdValue);
		}

		let nextFreeChunkId = -1;
		for (const id of usedIds) {
			nextFreeChunkId = Math.max(nextFreeChunkId, id);
		}
		nextFreeChunkId++;

		const unusedIds = [];
		if (nextFreeChunkId > 0) {
			let index = nextFreeChunkId;
			while (index--) {
				if (!usedIds.has(index)) {
					unusedIds.push(index);
				}
			}
		}

		for (let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			const chunk = chunks[indexChunk];
			if (chunk.id === null) {
				if (unusedIds.length > 0) {
					chunk.id = unusedIds.pop();
				} else {
					chunk.id = nextFreeChunkId++;
				}
			}
			if (!chunk.ids) {
				chunk.ids = [chunk.id];
			}
		}

	}

	sortItemsWithChunkIds() {
		for (const chunkGroup of this.chunkGroups) {
			chunkGroup.sortItems();
		}

		this.chunks.sort(byId);

		for (
			let indexModule = 0;
			indexModule < this.modules.length;
			indexModule++
		) {
			this.modules[indexModule].sortItems(true);
		}

		const chunks = this.chunks;
		for (let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			chunks[indexChunk].sortItems();
		}

		const chunks = this.chunks;
		for (let indexChunk = 0; indexChunk < chunks.length; indexChunk++) {
			chunks[indexChunk].sortItems();
		}

		const byMessage = (a, b) => {
			const ma = `${a.message}`;
			const mb = `${b.message}`;
			if (ma < mb) return -1;
			if (mb < ma) return 1;
			return 0;
		};

		this.errors.sort(byMessage);
		this.warnings.sort(byMessage);
		this.children.sort(byNameOrHash);
	}

	// 创建hash
	createHash() {
		const outputOptions = this.outputOptions;
		const hashFunction = outputOptions.hashFunction;
		const hashDigest = outputOptions.hashDigest;
		const hashDigestLength = outputOptions.hashDigestLength;
		const hash = createHash(hashFunction);
		if (outputOptions.hashSalt) {
			hash.update(outputOptions.hashSalt);
		}
		this.mainTemplate.updateHash(hash);
		this.chunkTemplate.updateHash(hash);
		for (const key of Object.keys(this.moduleTemplates).sort()) {
			this.moduleTemplates[key].updateHash(hash);
		}
		for (const child of this.children) {
			hash.update(child.hash);
		}
		for (const warning of this.warnings) {
			hash.update(`${warning.message}`);
		}
		for (const error of this.errors) {
			hash.update(`${error.message}`);
		}
		const modules = this.modules;
		for (let i = 0; i < modules.length; i++) {
			const module = modules[i];
			const moduleHash = createHash(hashFunction);
			module.updateHash(moduleHash);
			module.hash = (moduleHash.digest(hashDigest));
			module.renderedHash = module.hash.substr(0, hashDigestLength);
		}

		const chunks = this.chunks.slice();

		chunks.sort((a, b) => {
			const aEntry = a.hasRuntime();
			const bEntry = b.hasRuntime();
			if (aEntry && !bEntry) return 1;
			if (!aEntry && bEntry) return -1;
			return byId(a, b);
		});
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const chunkHash = createHash(hashFunction);
			try {
				if (outputOptions.hashSalt) {
					chunkHash.update(outputOptions.hashSalt);
				}
				chunk.updateHash(chunkHash);
				const template = chunk.hasRuntime()
					? this.mainTemplate
					: this.chunkTemplate;
				template.updateHashForChunk(
					chunkHash,
					chunk,
					this.moduleTemplates.javascript,
					this.dependencyTemplates
				);
				this.hooks.chunkHash.call(chunk, chunkHash);
				chunk.hash = (chunkHash.digest(hashDigest));
				hash.update(chunk.hash);
				chunk.renderedHash = chunk.hash.substr(0, hashDigestLength);
				this.hooks.contentHash.call(chunk);
			} catch (err) {
				this.errors.push(new ChunkRenderError(chunk, "", err));
			}
		}
		this.fullHash = (hash.digest(hashDigest));
		this.hash = this.fullHash.substr(0, hashDigestLength);
	}

	// 创建模块的静态资源
	createModuleAssets() {
		for (let i = 0; i < this.modules.length; i++) {
			const module = this.modules[i];
			if (module.buildInfo.assets) {
				const assetsInfo = module.buildInfo.assetsInfo;
				for (const assetName of Object.keys(module.buildInfo.assets)) {
					const fileName = this.getPath(assetName);
					this.emitAsset(
						fileName,
						module.buildInfo.assets[assetName],
						assetsInfo ? assetsInfo.get(assetName) : undefined
					);
					this.hooks.moduleAsset.call(module, fileName);
				}
			}
		}
	}

	// 创建静态资源的chunk
	createChunkAssets() {
		const outputOptions = this.outputOptions;
		const cachedSourceMap = new Map();
		const alreadyWrittenFiles = new Map();
		for (let i = 0; i < this.chunks.length; i++) {
			const chunk = this.chunks[i];
			chunk.files = [];
			let source;
			let file;
			let filenameTemplate;
			try {
				const template = chunk.hasRuntime()
					? this.mainTemplate
					: this.chunkTemplate;
				const manifest = template.getRenderManifest({
					chunk,
					hash: this.hash,
					fullHash: this.fullHash,
					outputOptions,
					moduleTemplates: this.moduleTemplates,
					dependencyTemplates: this.dependencyTemplates
				}); 
				for (const fileManifest of manifest) {
					const cacheName = fileManifest.identifier;
					const usedHash = fileManifest.hash;
					filenameTemplate = fileManifest.filenameTemplate;
					const pathAndInfo = this.getPathWithInfo(
						filenameTemplate,
						fileManifest.pathOptions
					);
					file = pathAndInfo.path;
					const assetInfo = pathAndInfo.info;

					const alreadyWritten = alreadyWrittenFiles.get(file);
					if (alreadyWritten !== undefined) {
						if (alreadyWritten.hash === usedHash) {
							if (this.cache) {
								this.cache[cacheName] = {
									hash: usedHash,
									source: alreadyWritten.source
								};
							}
							chunk.files.push(file);
							this.hooks.chunkAsset.call(chunk, file);
							continue;
						} else {
							throw new Error(
								`Conflict: Multiple chunks emit assets to the same filename ${file}` +
									` (chunks ${alreadyWritten.chunk.id} and ${chunk.id})`
							);
						}
					}
					if (
						this.cache &&
						this.cache[cacheName] &&
						this.cache[cacheName].hash === usedHash
					) {
						source = this.cache[cacheName].source;
					} else {
						source = fileManifest.render();
						if (!(source instanceof CachedSource)) {
							const cacheEntry = cachedSourceMap.get(source);
							if (cacheEntry) {
								source = cacheEntry;
							} else {
								const cachedSource = new CachedSource(source);
								cachedSourceMap.set(source, cachedSource);
								source = cachedSource;
							}
						}
						if (this.cache) {
							this.cache[cacheName] = {
								hash: usedHash,
								source
							};
						}
					}
					this.emitAsset(file, source, assetInfo);
					chunk.files.push(file);
					this.hooks.chunkAsset.call(chunk, file);
					alreadyWrittenFiles.set(file, {
						hash: usedHash,
						source,
						chunk
					});
				}
			} catch (err) {
				this.errors.push(
					new ChunkRenderError(chunk, file || filenameTemplate, err)
				);
			}
		}
	}
	// 获取文件路径
	getPath(filename, data) {
		data = data || {};
		data.hash = data.hash || this.hash;
		return this.mainTemplate.getAssetPath(filename, data);
	}
	getPathWithInfo(filename, data) {
		data = data || {};
		data.hash = data.hash || this.hash;
		return this.mainTemplate.getAssetPathWithInfo(filename, data);
	}
	emitAsset(file, source, assetInfo = {}) {
		if (this.assets[file]) {
			if (!isSourceEqual(this.assets[file], source)) {
				this.warnings.push(
					new WebpackError(
						`Conflict: Multiple assets emit different content to the same filename ${file}`
					)
				);
				this.assets[file] = source;
				this.assetsInfo.set(file, assetInfo);
				return;
			}
			const oldInfo = this.assetsInfo.get(file);
			this.assetsInfo.set(file, Object.assign({}, oldInfo, assetInfo));
			return;
		}
		this.assets[file] = source;
		this.assetsInfo.set(file, assetInfo);
	}

	// 更新资源
	updateAsset(
		file,
		newSourceOrFunction,
		assetInfoUpdateOrFunction = undefined
	) {
		if (!this.assets[file]) {
			throw new Error(
				`Called Compilation.updateAsset for not existing filename ${file}`
			);
		}
		if (typeof newSourceOrFunction === "function") {
			this.assets[file] = newSourceOrFunction(this.assets[file]);
		} else {
			this.assets[file] = newSourceOrFunction;
		}
		if (assetInfoUpdateOrFunction !== undefined) {
			// TODO
		}
	}

	// 获取资源
	getAssets() {
		const array = [];
		for (const assetName of Object.keys(this.assets)) {
			if (Object.prototype.hasOwnProperty.call(this.assets, assetName)) {
				array.push({
					name: assetName,
					source: this.assets[assetName],
					info: this.assetsInfo.get(assetName) || {}
				});
			}
		}
		return array;
	}


	// 获取依赖引用
	getDependencyReference(module, dependency) {
		if (typeof dependency.getReference !== "function") return null;
		const ref = dependency.getReference();
		if (!ref) return null;
		return this.hooks.dependencyReference.call(ref, dependency, module);
	}

	// 添加chunk，如果缓存有，则从缓存中取，否则创建一个新的chunk
	addChunk(name) {
		if (name) {
			const chunk = this.namedChunks.get(name);
			if (chunk !== undefined) {
				return chunk;
			}
		}

		const chunk = new Chunk(name);
		this.chunks.push(chunk);
		if (name) {
			this.namedChunks.set(name, chunk);
		}
		return chunk;
	}

	// 深度合并
	assignDepth(module) {
		const queue = new Set([module]);
		let depth;

		module.depth = 0;

		// 添加module到任务队列
		const enqueueJob = module => {
			const d = module.depth;
			if (typeof d === "number" && d <= depth) return;
			queue.add(module);
			module.depth = depth;
		}

		const assignDepthToDependency = dependency => {
			if (dependency.module) {
				enqueueJob(dependency.module);
			}
		}

		// 合并依赖
		const assignDepthToDependencyBlock = block => {
			if (block.variables) {
				iterationBlockVariable(block.variables, assignDepthToDependency);
			}

			if (block.dependencies) {
				iterationOfArrayCallback(block.dependencies, assignDepthToDependency);
			}

			if (block.blocks) {
				iterationOfArrayCallback(block.blocks, assignDepthToDependencyBlock);
			}
		}

		for (module of queue) {
			queue.delete(module);
			depth = module.depth;

			depth++;
			assignDepthToDependencyBlock(module);
		}
	}
}