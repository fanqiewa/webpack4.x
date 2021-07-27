/**
 * compiler
 */
"use strict";

const parseJson = require("json-parse-better-errors");
const asyncLib = require("neo-async");
const path = require("path");
const { Source } = require("webpack-sources");
const util = require("util");
const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");

const Compilation = require("./Compilation");
const Stats = require("./Stats");
const Watching = require("./Watching");
const NormalModuleFactory = require("./NormalModuleFactory");
const ContextModuleFactory = require("./ContextModuleFactory");
const ResolverFactory = require("./ResolverFactory");

const RequestShortener = require("./RequestShortener");
const { makePathsRelative } = require("./util/identifier");
const ConcurrentCompilationError = require("./ConcurrentCompilationError");
const { Logger } = require("./logging/Logger");

class Compiler extends Tapable {
  constructor(context) {
    super();
    this.hooks = {

    }
  }

  // 运行编译器
  run(callback) {
    if (this.running) return callback(new ConcurrentCompilationError());

    // 最后的回调
    const finalCallback = (err, stats) => {
      this.running = false;

      if (err) {
        this.hooks.failed.call(err);
      }

      if (callback !== undefined) return callback(err, stats);
    }

    // 开始时间
    const startTime = Date.now();

    this.running = true;

		// afterCompile之后的回调
    const onCompiled = (err, compilation) => {
			if (err) return finalCallback(err);

      if (this.hooks.shouldEmit.call(compilation) === false) {
				const stats = new Stats(compilation);
				stats.startTime = startTime;
				stats.endTime = Date.now();
				this.hooks.done.callAsync(stats, err => {
					if (err) return finalCallback(err);
					return finalCallback(null, stats);
				});
				return;
      }
      
      this.emitAssets(compilation, err => {
        // 写完文件夹和文件名的回调
				if (err) return finalCallback(err);

				if (compilation.hooks.needAdditionalPass.call()) {
					// TODO
				}
        
				this.emitRecords(err => {
					if (err) return finalCallback(err);

					const stats = new Stats(compilation);
					stats.startTime = startTime;
					stats.endTime = Date.now();
					this.hooks.done.callAsync(stats, err => {
						if (err) return finalCallback(err);
						return finalCallback(null, stats);
					});
				});
      })
    }

    // 触发beforeRun - hook
    this.hooks.beforeRun.callAsync(this, err => {
      if (err) return finalCallback(err);
      
      // 触发run - hook
      this.hooks.run.callAsync(this, err => {
        if (err) return finalCallback(err);

        this.readRecords(err => {
          if (err) return finalCallback(err);

          // 编译
          this.compile(onCompiled);
        })
      })
    })
  }

  // 发出记录
	emitRecords(callback) {
		if (!this.recordsOutputPath) return callback();
		const idx1 = this.recordsOutputPath.lastIndexOf("/");
		const idx2 = this.recordsOutputPath.lastIndexOf("\\");
		let recordsOutputPathDirectory = null;
		if (idx1 > idx2) {
			recordsOutputPathDirectory = this.recordsOutputPath.substr(0, idx1);
		} else if (idx1 < idx2) {
			recordsOutputPathDirectory = this.recordsOutputPath.substr(0, idx2);
		}

		const writeFile = () => {
			this.outputFileSystem.writeFile(
				this.recordsOutputPath,
				JSON.stringify(this.records, undefined, 2),
				callback
			);
		};

		if (!recordsOutputPathDirectory) {
			return writeFile();
		}
		this.outputFileSystem.mkdirp(recordsOutputPathDirectory, err => {
			if (err) return callback(err);
			writeFile();
		});
	}

  // 读取记录
  readRecords(callback) {
    if (!this.recordsInputPath) {
      this.records = {};
      return callback();
    }

    // TODO
  }

	createCompilation() {
		return new Compilation(this);
	}

  newCompilation(params) {
    const compilation = this.createCompilation();
		compilation.fileTimestamps = this.fileTimestamps;
		compilation.contextTimestamps = this.contextTimestamps;
		compilation.name = this.name;
		compilation.records = this.records;
		compilation.compilationDependencies = params.compilationDependencies;
    // 触发hook - thisCompilation
		this.hooks.thisCompilation.call(compilation, params);
    // 触发hook - compilation
		this.hooks.compilation.call(compilation, params);
		return compilation;
  }

  // 创建规范化模块工厂
  createNormalModuleFactory() {
    const normalModuleFactory = new NormalModuleFactory(
      this.options.context,
      this.resolverFactory,
      this.options.module || {}
    );
    // 触发hook - normalModuleFactory
    this.hooks.normalModuleFactory.call(normalModuleFactory);
    return normalModuleFactory;
  }

  // 创建上下文模块工厂
  createContextModuleFactory() {
    const contextModuleFactory = new ContextModuleFactory(this.resolverFactory);
    this.hooks.contextModuleFactory.call(contextModuleFactory);
    return contextModuleFactory;
  }

  // 注册编译参数
  newCompilationParams() {
    const params = {
      normalModuleFactory: this.createNormalModuleFactory(),
      contextModuleFactory: this.createContextModuleFactory(),
			compilationDependencies: new Set()
    };
    return params;
  }

  // 编译函数
  compile(callback) {
    const params = this.newCompilationParams();
    // 触发hook - beforeCompile
    this.hooks.beforeCompile.callAsync(params, err => {
      if (err) return callback(err);

      // 触发hook - compile
      this.hooks.compile.call(params);

      const compilation = this.newCompilation(params);

      // 触发hook - make
      this.hooks.make.callAsync(compilation, err => {
        if (err) return callback(err);

				// 完成
        compilation.finish(err => {
          if (err) return callback(err);

					// 密封、关闭
          compilation.seal(err => {
            if (err) return callback(err);
            
						this.hooks.afterCompile.callAsync(compilation, err => {
							if (err) return callback(err);

              // callback === onCompiled
							return callback(null, compilation);
						});
          })
        })
      })
    })
  }

  // 清除写入文件流
  purgeInputFileSystem() {
    if (this.inputFileSystem && this.inputFileSystem.purge) {
      this.inputFileSystem.purge();
    }
  }

	// 发出静态资源
  emitAssets(compilation, callback) {
    let outputPath;
    // 目录生成成功回调
    const emitFiles = err => {
      if (err) return callback(err);

      asyncLib.forEachLimit(
        compilation.getAssets(),
        15,
        ({ name: file, source }, callback) => {
					let targetFile = file;
					const queryStringIdx = targetFile.indexOf("?");
					if (queryStringIdx >= 0) {
						targetFile = targetFile.substr(0, queryStringIdx);
					}

					const writeOut = err => {
						if (err) return callback(err);
						const targetPath = this.outputFileSystem.join(
							outputPath,
							targetFile
						);
						if (this.options.output.futureEmitAssets) {
							const targetFileGeneration = this._assetEmittingWrittenFiles.get(
								targetPath
							);

							let cacheEntry = this._assetEmittingSourceCache.get(source);
							if (cacheEntry === undefined) {
								cacheEntry = {
									sizeOnlySource: undefined,
									writtenTo: new Map()
								};
								this._assetEmittingSourceCache.set(source, cacheEntry);
							}

							if (targetFileGeneration !== undefined) {
								const writtenGeneration = cacheEntry.writtenTo.get(targetPath);
								if (writtenGeneration === targetFileGeneration) {

									compilation.updateAsset(file, cacheEntry.sizeOnlySource, {
										size: cacheEntry.sizeOnlySource.size()
									});

									return callback();
								}
							}


							let content;
							if (typeof source.buffer === "function") {
								content = source.buffer();
							} else {
								const bufferOrString = source.source();
								if (Buffer.isBuffer(bufferOrString)) {
									content = bufferOrString;
								} else {
									content = Buffer.from(bufferOrString, "utf8");
								}
							}

							cacheEntry.sizeOnlySource = new SizeOnlySource(content.length);
							compilation.updateAsset(file, cacheEntry.sizeOnlySource, {
								size: content.length
							});

							this.outputFileSystem.writeFile(targetPath, content, err => {
								if (err) return callback(err);

								compilation.emittedAssets.add(file);

								const newGeneration =
									targetFileGeneration === undefined
										? 1
										: targetFileGeneration + 1;
								cacheEntry.writtenTo.set(targetPath, newGeneration);
								this._assetEmittingWrittenFiles.set(targetPath, newGeneration);
								this.hooks.assetEmitted.callAsync(file, content, callback);
							});
						} else {
							if (source.existsAt === targetPath) {
								source.emitted = false;
								return callback();
							}
							let content = source.source();

							if (!Buffer.isBuffer(content)) {
								content = Buffer.from(content, "utf8");
							}

							source.existsAt = targetPath;
							source.emitted = true;
              // 写入文件
							this.outputFileSystem.writeFile(targetPath, content, err => {
                // 完成写入回调
								if (err) return callback(err);
								this.hooks.assetEmitted.callAsync(file, content, callback);
							});
						}
					};
					if (targetFile.match(/\/|\\/)) {
						const dir = path.dirname(targetFile);
						this.outputFileSystem.mkdirp(
							this.outputFileSystem.join(outputPath, dir),
							writeOut
						);
					} else {
						writeOut();
					}
        },
        err => {
          if (err) return callback(err);

          this.hooks.afterEmit.callAsync(compilation, err => {
            if (err) return callback(err);

            return callback();
          });
        }
      )
    }

    this.hooks.emit.callAsync(compilation, err => {
      if (err) return callback(err);
      outputPath = compilation.getPath(this.outputPath);
      // 生成文件路径
      this.outputFileSystem.mkdirp(outputPath, emitFiles);
    })
  }
}