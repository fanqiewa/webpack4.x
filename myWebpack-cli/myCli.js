

const { NON_COMPILATION_ARGS } = require("./utils/constants");

(function () {
	const importLocal = require("import-local");

	// import-local 实际上是把 webpack-cli/bin/cli.js 进行一次 path.join("webpack-cli", "bin/cli.js")，
	// 得到一个所谓的本地路径，然后再把__filename 和这个本地路径求一次相对路径，
	// 如果相对路径是一个空字符串，则代表本地没有其它可以访问的 webpack-cli cli.js, 此时 importLocal(__filename) 返回 null，
	// 如果本地没有其它的 webpack-cli，这里肯定是不会进入执行的
	if (importLocal(__filename)) {
		// 'H:\-----------------------------\webpack\webpack-demo\node_modules\webpack-cli\bin\cli.js'
		return;
	}

	// require("v8-compile-cache");

	const ErrorHelpers = require("./utils/errorHelpers");
	// process.argv返回两个参数
	//  第一个元素是 process.execPath
	//  第二个元素是正被执行的 JavaScript 文件的路径
	const NON_COMPILATION_CMD = process.argv.find(arg => {
		if (arg === "serve") {
			global.process.argv = global.process.argv.filter(a => a !== "serve");
			process.argv = global.process.argv;
		}
		return NON_COMPILATION_ARGS.find(a => a === arg);
	});
	// 不需要编译的命令
	if (NON_COMPILATION_CMD) {
		return require("./utils/prompt-command")(NON_COMPILATION_CMD);
	}

	// yargs是nodejs环境下的命令行参数解析工具
	// usage 设置命令的提示的使用方法。
	const yargs = require("yargs").usage(`webpack-cli ${require("../package.json").version}

Usage: webpack-cli [options]
       webpack-cli [options] --entry <entry> --output <output>
       webpack-cli [options] <entries...> --output <output>
       webpack-cli <command> [options]

For more information, see https://webpack.js.org/api/cli/.`);


	/*----------------------------------------------*/
	// require('yargs').argv;
	// require('yargs').parse();   // 无参时和上面等价
	// node base.js       { _: [], '$0': 'base.js' }
	// node base.js -a=2  { _: [], a: 2, '$0': 'base.js' } 通过命令行-a赋值

	// _存放的是不带单横杠（-）或双横杠（--）的参数
	// $0是命令脚本
	// { _: [], '$0': 'myCli.js' }
	// console.log(yargs.parse())
	/*----------------------------------------------*/

	require("./config/config-yargs")(yargs);
	yargs.parse(process.argv.slice(2), (err, argv, output) => {
		// console.log(argv)
		/*
				{
						_: [],
						cache: null, // 默认赋值了一个null .default
						bail: null,
						profile: null,
						color: { level: 3, hasBasic: true, has256: true, has16m: true },
						colors: { level: 3, hasBasic: true, has256: true, has16m: true },
						'info-verbosity': 'info',
						infoVerbosity: 'info',
						'$0': 'myCli.js'
				}
		*/
		Error.stackTraceLimit = 30;

		// 失败
		if (err && output) {
			console.error(output);
			process.exitCode = 1;
			return;
		}

		// help or version info
		if (output) { // output一般为空
			console.log(output);
			return;
		}
		// console.log(argv.verbose) undefined
		if (argv.verbose) {
			argv["display"] = "verbose";
		}
		let options;

		try {
			// 已完成
			/**
					options = {
							mode: 'production',
							entry: { main: './src/main.js' },
							output: {
									filename: '[name].js',
									path: 'H:\\不回头\\webpack\\webpack-demo\\dist'
							},
							context: 'H:\\不回头\\webpack\\webpack-demo\\webpack-cli'
					}
			 */
			options = require("./utils/convert-argv")(argv);
		} catch (err) {
			if (err.code === "MODULE_NOT_FOUND") {
				const moduleName = err.message.split("'")[1];
				let instructions = "";
				let errorMessage = "";

				if (moduleName === "webpack") {
					errorMessage = `\n${moduleName} not installed`;
					instructions = `Install webpack to start bundling: \u001b[32m\n  $ npm install --save-dev ${moduleName}\n`;

					if (process.env.npm_execpath !== undefined && process.env.npm_execpath.includes("yarn")) {
						instructions = `Install webpack to start bundling: \u001b[32m\n $ yarn add ${moduleName} --dev\n`;
					}
					Error.stackTraceLimit = 1;
					console.error(`${errorMessage}\n\n${instructions}`);
					process.exitCode = 1;
					return;
				}
			}

			if (err.name !== "ValidationError") {
				throw err;
			}

			const stack = ErrorHelpers.cleanUpWebpackOptions(err.stack, err.message);
			const message = err.message + "\n" + stack;

			if (argv.color) {
				console.error(`\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`);
			} else {
				console.error(message);
			}

			process.exitCode = 1;
			return;
		}

		// 标准输出流
		const stdout = argv.silent ? { write: () => { } } : process.stdout;

		/**
		 * 
		 * @param {*} name 命令行命令名称
		 * @param {*} fn 回调函数
		 * @param {*} init 
		 */
		function ifArg(name, fn, init) {
			if (Array.isArray(argv[name])) {
				if (init) init();
				argv[name].forEach(fn);
			} else if (typeof argv[name] !== "undefined") {
				if (init) init();
				fn(argv[name], -1);
			}
		}

		// 执行命令
		function processOptions(options) {
			// process Promise
			if (typeof options.then === "function") {
				options.then(processOptions).catch(function (err) {
					console.error(err.stack || err);
					// eslint-disable-next-line no-process-exit
					process.exit(1);
				});
				return;
			}

			const firstOptions = [].concat(options)[0];
			// statsPresetToOptions = Stats.js => static presetToOptions(name) {} Stats类上面的方法
			const statsPresetToOptions = require("webpack").Stats.presetToOptions;
			// outputOptions = undefined
			let outputOptions = options.stats;

			if (typeof outputOptions === "boolean" || typeof outputOptions === "string") {
				outputOptions = statsPresetToOptions(outputOptions);
			} else if (!outputOptions) {
				outputOptions = {};
			}
			// outputOptions = {}

			ifArg("display", function (preset) {
				outputOptions = statsPresetToOptions(preset);
			});

			outputOptions = Object.create(outputOptions);
			if (Array.isArray(options) && !outputOptions.children) {
				// 不进入
				outputOptions.children = options.map(o => o.stats);
			}
			if (typeof outputOptions.context === "undefined") outputOptions.context = firstOptions.context;

			ifArg("env", function (value) {
				if (outputOptions.env) {
					outputOptions._env = value;
				}
			});

			ifArg("json", function (bool) {
				if (bool) {
					outputOptions.json = bool;
					outputOptions.modules = bool;
				}
			});

			// outputOptions.colors = colors: { level: 3, hasBasic: true, has256: true, has16m: true }
			if (typeof outputOptions.colors === "undefined") outputOptions.colors = require("supports-color").stdout;

			ifArg("sort-modules-by", function (value) {
				outputOptions.modulesSort = value;
			});

			ifArg("sort-chunks-by", function (value) {
				outputOptions.chunksSort = value;
			});

			ifArg("sort-assets-by", function (value) {
				outputOptions.assetsSort = value;
			});

			ifArg("display-exclude", function (value) {
				outputOptions.exclude = value;
			});

			if (!outputOptions.json) {
				if (typeof outputOptions.cached === "undefined") outputOptions.cached = false;
				if (typeof outputOptions.cachedAssets === "undefined") outputOptions.cachedAssets = false;

				ifArg("display-chunks", function (bool) {
					if (bool) {
						outputOptions.modules = false;
						outputOptions.chunks = true;
						outputOptions.chunkModules = true;
					}
				});

				ifArg("display-entrypoints", function (bool) {
					outputOptions.entrypoints = bool;
				});

				ifArg("display-reasons", function (bool) {
					if (bool) outputOptions.reasons = true;
				});

				ifArg("display-depth", function (bool) {
					if (bool) outputOptions.depth = true;
				});

				ifArg("display-used-exports", function (bool) {
					if (bool) outputOptions.usedExports = true;
				});

				ifArg("display-provided-exports", function (bool) {
					if (bool) outputOptions.providedExports = true;
				});

				ifArg("display-optimization-bailout", function (bool) {
					if (bool) outputOptions.optimizationBailout = bool;
				});

				ifArg("display-error-details", function (bool) {
					if (bool) outputOptions.errorDetails = true;
				});

				ifArg("display-origins", function (bool) {
					if (bool) outputOptions.chunkOrigins = true;
				});

				ifArg("display-max-modules", function (value) {
					outputOptions.maxModules = +value;
				});

				ifArg("display-cached", function (bool) {
					if (bool) outputOptions.cached = true;
				});

				ifArg("display-cached-assets", function (bool) {
					if (bool) outputOptions.cachedAssets = true;
				});

				if (!outputOptions.exclude) outputOptions.exclude = ["node_modules", "bower_components", "components"];

				if (argv["display-modules"]) {
					outputOptions.maxModules = Infinity;
					outputOptions.exclude = undefined;
					outputOptions.modules = true;
				}
			}

			ifArg("hide-modules", function (bool) {
				if (bool) {
					outputOptions.modules = false;
					outputOptions.chunkModules = false;
				}
			});

			ifArg("info-verbosity", function (value) {
				outputOptions.infoVerbosity = value;
			});

			ifArg("build-delimiter", function (value) {
				outputOptions.buildDelimiter = value;
			});

			const webpack = require("webpack");
			let lastHash = null;
			let compiler;
			try {
				// 初始化编译器
				compiler = webpack(options);
			} catch (err) {
				if (err.name === "WebpackOptionsValidationError") {
					if (argv.color) console.error(`\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m`);
					else console.error(err.message);
					process.exit(1);
				}

				throw err;
			}

			if (argv.progress) {
				const ProgressPlugin = require("webpack").ProgressPlugin;
				new ProgressPlugin({
					profile: argv.profile
				}).apply(compiler);
			}

			if (outputOptions.infoVerbosity === "verbose") {
				if (argv.w) {
					compiler.hooks.watchRun.tap("WebpackInfo", compilation => {
						const compilationName = compilation.name ? compilation.name : "";
						console.error("\nCompilation " + compilationName + " starting…\n");
					});
				} else {
					compiler.hooks.beforeRun.tap("WebpackInfo", compilation => {
						const compilationName = compilation.name ? compilation.name : "";
						console.error("\nCompilation " + compilationName + " starting…\n");
					});
				}
				compiler.hooks.done.tap("WebpackInfo", compilation => {
					const compilationName = compilation.name ? compilation.name : "";
					console.error("\nCompilation " + compilationName + " finished\n");
				});
			}

			// 编译完成回调
			function compilerCallback(err, stats) {
				if (!options.watch || err) {
					compiler.purgeInputFileSystem();
				}
				if (err) {
					lastHash = null;
					console.error(err.stack || err);
					if (err.details) console.error(err.details);
					process.exitCode = 1;
					return;
				}
				if (outputOptions.json) {
					stdout.write(JSON.stringify(stats.toJson(outputOptions), null, 2) + "\n");
				} else if (stats.hash !== lastHash) {
					lastHash = stats.hash;
					// 编译报错
					if (stats.compilation && stats.compilation.errors.length !== 0) {
						const errors = stats.compilation.errors;
						if (errors[0].name === "EntryModuleNotFoundError") {
							console.error("\n\u001b[1m\u001b[31mInsufficient number of arguments or no entry found.");
							console.error(
								"\u001b[1m\u001b[31mAlternatively, run 'webpack(-cli) --help' for usage info.\u001b[39m\u001b[22m\n"
							);
						}
					}
					const statsString = stats.toString(outputOptions);
					const delimiter = outputOptions.buildDelimiter ? `${outputOptions.buildDelimiter}\n` : "";
					// 输出打包信息
					if (statsString) stdout.write(`${statsString}\n${delimiter}`);
				}
				// 没有watch且stats有错误，退出程序
				if (!options.watch && stats.hasErrors()) {
					process.exitCode = 2;
				}
			}

			// undefined
			// 是否启动watch模式 
			if (firstOptions.watch || options.watch) {
				const watchOptions =
					firstOptions.watchOptions || options.watchOptions || firstOptions.watch || options.watch || {};
				if (watchOptions.stdin) {
					process.stdin.on("end", function (_) {
						process.exit(); // eslint-disable-line
					});
					process.stdin.resume();
				}
				compiler.watch(watchOptions, compilerCallback);
				if (outputOptions.infoVerbosity !== "none") console.error("\nwebpack is watching the files…\n");
			} else {
				// 执行compiler的run方法
				compiler.run((err, stats) => {
					if (compiler.close) {
						compiler.close(err2 => {
							compilerCallback(err || err2, stats);
						});
					} else {
						compilerCallback(err, stats);
					}
				});
			}
		}
		// 处理options
		processOptions(options);
	})
})();