
"use strict";

const NativeModule = require("module");

const {
	CachedSource,
	LineToLineMappedSource,
	OriginalSource,
	RawSource,
	SourceMapSource
} = require("webpack-sources");
const { getContext, runLoaders } = require("loader-runner");

const WebpackError = require("./WebpackError");
const Module = require("./Module");
const ModuleParseError = require("./ModuleParseError");
const ModuleBuildError = require("./ModuleBuildError");
const ModuleError = require("./ModuleError");
const ModuleWarning = require("./ModuleWarning");
const createHash = require("./util/createHash");
const contextify = require("./util/identifier").contextify;

// 将Buffer流转成字符串
const asString = buf => {
	if (Buffer.isBuffer(buf)) {
		return buf.toString("utf-8");
	}
	return buf;
};

// 将字符串转成Buffer流
const asBuffer = str => {
	if (!Buffer.isBuffer(str)) {
		return Buffer.from(str, "utf-8");
	}
	return str;
}

class NonErrorEmittedError extends WebpackError {
	constructor(error) {
		super();

		this.name = "NonErrorEmittedError";
		this.message = "(Emitted value instead of an instance of Error) " + error;

		Error.captureStackTrace(this, this.constructor);
	}
}

class NormalModule extends Module {
  constructor({
		type,
		request,
		userRequest,
		rawRequest,
		loaders,
		resource,
		matchResource,
		parser,
		generator,
		resolveOptions
  }) {
		super(type, getContext(resource));

		this.request = request;
		this.userRequest = userRequest;
		this.rawRequest = rawRequest;
		this.binary = type.startsWith("webassembly");
		this.parser = parser;
		this.generator = generator;
		this.resource = resource;
		this.matchResource = matchResource;
		this.loaders = loaders;
		if (resolveOptions !== undefined) this.resolveOptions = resolveOptions;

		this.error = null;
		this._source = null;
		this._sourceSize = null;
		this._buildHash = "";
		this.buildTimestamp = undefined;
		this._cachedSources = new Map();

		this.useSourceMap = false;
		this.lineToLine = false;

		this._lastSuccessfulBuildMeta = {};
  }

	// 标识符
	identifier() {
		return this.request;
	}

	nameForCondition() {
		const resource = this.matchResource || this.resource;
		const idx = resource.indexOf("?");
		if (idx >= 0) return resource.substr(0, idx);
		return resource;
	}

	
	// 创建loader上下文
	createLoaderContext(resolver, options, compilation, fs) {
		const requestShortener = compilation.runtimeTemplate.requestShortener;
		const getCurrentLoaderName = () => {
			// TODO
		}
		const loaderContext = {
			version: 2,
			emitWarning: warning => {
				// TODO
			},
			emitError: error => {
				// TODO
			},
			getLogger: name => {
				// TODO
			},
			exec: (code, filename) => {
				// TODO
			},
			resolve(context, request, callback) {
				// TODO
			},
			getResolve(options) {
				// TODO
			},
			emitFile: (name, content, sourceMap, assetInfo) => {
				// TODO
			},
			rootContext: options.context,
			webpack: true,
			sourceMap: !!this.useSourceMap,
			mode: options.mode || "production",
			_module: this,
			_compilation: compilation,
			_compiler: compilation.compiler,
			fs: fs
		}
		compilation.hooks.normalModuleLoader.call(loaderContext, this);
		if (options.loader) {
			Object.assign(loaderContext, options.loader);
		}

		return loaderContext;
	}

	// 创建源文件
	createSource(source, resourceBuffer, sourceMap) {
		if (!this.identifier) {
			// 如果没有标识符，则返回原生的源
			return new RawSource(source);
		}

		const identifier = this.identifier();

		if (this.lineToLine && resourceBuffer) {
			// TODO
		}

		if (this.useSourceMap && sourceMap) {
			// TODO
		}

		if (Buffer.isBuffer(source)) {
			// TODO
		}

		return new OriginalSource(source, identifier);
	}

	// 执行build
	doBuild(options, compilation, resolver, fs, callback) {
		const loaderContext = this.createLoaderContext(
			resolver,
			options,
			compilation,
			fs
		);
		
		// 执行loader
		runLoaders(
			{
				resource: this.resource, // 读取的文件
				loaders: this.loaders, // loaders数组
				context: loaderContext, // loader上下文对象
				readResource: fs.readFile.bind(fs) 
			},
			(err, result) => {
				// result为返回结果，包括读取的文件内容
				if (result) {
					this.buildInfo.cacheable = result.cacheable;
					this.buildInfo.fileDependencies = new Set(result.fileDependencies);
					this.buildInfo.contextDependencies = new Set(
						result.contextDependencies
					);
				}

				if (err) {
					if (!err instanceof Error) {
						err = new NonErrorEmittedError(err);
					}
				}

				const resourceBuffer = result.resourceBuffer;
				const source = result.result[0];
				const sourceMap = result.result.length >= 1 ? result.result[1] : null;
				const extraInfo = result.result.length >= 2 ? result.result[2] : null;

				// 读取的文件内容如果不为Buffer或string类型，抛出异常
				if (!Buffer.isBuffer(source) && typeof source !== "string") {
					const currentLoader = this.getCurrentLoader(loaderContext, 0);
					const err = new Error(
						`Final loader (${
							currentLoader
								? compilation.runtimeTemplate.requestShortener.shorten(
									currentLoader.loader
								)
								: "unknown"
						}) didn't return a Buffer or String`
					);
					const error = new ModuleBuildError(this, err);
					return callback(error);
				}

				this._source = this.createSource(
					this.binary ? asBuffer(source) : asString(source),
					resourceBuffer,
					sourceMap
				);
				this._sourceSize = null;
				this._ast = 
					typeof extraInfo === "object" &&
					extraInfo !== null &&
					extraInfo.webpackAST !== undefined
						? extraInfo.webpackAST
						: null;

				return callback();
			}
		)
	}

	shouldPreventParsing(noParseRule, request) {
		if (!noParseRule) {
			return false;
		}
		// TODO
	}

	// 初始化build模块的hash值
	_initBuildHash(compilation) {
		const hash = createHash(compilation.outputOptions.hashFunction);
		if (this._source) {
			hash.update("source");
			this._source.updateHash(hash);
		}
		hash.update("meta");
		hash.update(JSON.stringify(this.buildMeta));
		this._buildHash = (hash.digest("hex"));
	}

	// build 模块
	build(options, compilation, resolver, fs, callback) {
		this.buildTimestamp = Date.now();
		this.built = true;
		this._source = null;
		this._sourceSize = null;
		this._ast = null;
		this._buildHash = "";
		this.error = null;
		this.errors.length = 0;
		this.warnings.length = 0;
		this.buildMeta = {};
		this.buildInfo = {
			cacheable: false,
			fileDependencies: new Set(),
			contextDependencies: new Set(),
			assets: undefined,
			assetsInfo: undefined
		};
		
		return this.doBuild(options, compilation, resolver, fs, err => {
			this._cachedSources.clear();
			if (err) {
				this.markModuleAsErrored(err);
				this._initBuildHash(compilation);
				return callback();
			}

			const noParseRule = options.module && options.module.noParse;
			// 阻止parse
			if (this.shouldPreventParsing(noParseRule, this.request)) {
				this._initBuildHash(compilation);
				return ccallback();
			}

			// 处理解析错误
			const handleParseError = e => {
				const source = this._source.source();
				const loaders = this.loaders.map(item => 
					contextify(options.context, item.loader)
				);
				const error = new ModuleParseError(this, source, e, loaders);
				this.markModuleAsErrored(error);
				this._initBuildHash(compilation);
				return callback();
			}

			// 处理解析结果
			const handleParseResult = result => {
				this._lastSuccessfulBuildMeta = this.buildMeta;
				this._initBuildHash(compilation);
				return callback();
			}

			try {
				// 解析源文件内容
				const result = this.parser.parse(
					this._ast || this._source.source(),
					{
						current: this,
						module: this,
						compilation: compilation,
						options: options
					},
					(err, result) => {
						if (err) {
							handleParseError(err);
						} else {
							handleParseResult(result);
						}
					}
				);

				if (result !== undefined) {
					handleParseResult(result);
				}
			} catch (e) {
				handleParseError(e);
			}
		})
	}

	// 标记模块错误
	markModuleAsErrored(error) {
		this.buildMeta = Object.assign({}, this._lastSuccessfulBuildMeta);
		this.error = error;
		this.errprs.push(this.error);
		this._source = new RawSource(
			"throw new Error(" + JSON.stringify(this.error.message) + ");"
		);
		this._sourceSize = null;
		this._ast = null;
	}

	// 目录识别
	libIdent(options) {
		return contextify(options.context, this.userRequest);
	}
}

module.exports = NormalModule;