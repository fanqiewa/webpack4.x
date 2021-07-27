
"use strict";

const addToSet = (a, b) => {
	for (const item of b) {
		if (!a.includes(item)) a.push(item);
	}
	return a;
};

// 判断子级目录是否已经use了
const isSubset = (biggerSet, subset) => {
	if (biggerSet === true) return true;
	if (subset === true) return false;
	return subset.every(item => biggerSet.indexOf(item) >= 0);
};


class FlagDependencyUsagePlugin {
	apply(compiler) {
    // 注入hook - FlagDependencyUsagePlugin
		compiler.hooks.compilation.tap("FlagDependencyUsagePlugin", compilation => {
      compilation.hooks.optimizeDependencies.tap(
				"FlagDependencyUsagePlugin",
				modules => {
					// 处理模块
					const processModule = (module, usedExports) => {
						module.used = true;
						if (module.usedExports === true) return;
						if (usedExports === true) {
							// 代码中含有exports
							module.usedExports = true;
						} else if (Array.isArray(usedExports)) {
							const old = module.usedExports ? module.usedExports.length : -1;
							module.usedExports = addToSet(
								module.usedExports || [],
								usedExports
							);
							if (module.usedExports.length === old) {
								return;
							}
						} else if (Array.isArray(module.usedExports)) {
							return;
						} else {
							module.usedExports = false;
						}

						if (module.factoryMeta.sideEffectFree) {
							// TODO
						}

						queue.push([module, module, module.usedExports]);
					}

					// 处理依赖模块
					const processDependenciesBlock = (module, depBlock, usedExports) => {
						// 处理JavaScript中的代码块
						for (const dep of depBlock.dependencies) {
							processDependency(module, dep);
						}
						for (const variable of depBlock.variables) {
							for (const dep of variable.dependencies) {
								processDependency(module, dep);
							}
						}
						for (const block of depBlock.blocks) {
							queue.push([module, block, usedExports]);
						}
					}

					const processDependency = (module, dep) => {
						// 获取引用
						const reference = compilation.getDependencyReference(module, dep);
						if (!reference) return;
						// 引用的模块
						const referenceModule = reference.module;

						const importedNames = reference.importedNames;
						// 是否已被使用
						const oldUsed = referenceModule.used;
						// 是否含有exports
						const oldUsedExports = referenceModule.usedExports;
						if (
							!oldUsed ||
							(importedNames &&
								(!oldUsedExports || !isSubset(oldUsedExports, importedNames)))
						) {
							// 处理子模块
							processModule(referenceModule, importedNames);
						}
					}
					
					for (const module of modules) {
						if (!module.used) module.used = false;
					}
					
					const queue = [];
					// 处理入口模块
					for (const preparedEntrypoint of compilation._preparedEntrypoints) {
						if (preparedEntrypoint.module) {
							processModule(preparedEntrypoint.module, true);
						}
					}

					while (queue.length) {
						const queueItem = queue.pop();
						processDependenciesBlock(queueItem[0], queueItem[1], queueItem[2]);
					}
				}
			);
    })
  }
}
module.exports = FlagDependencyUsagePlugin;