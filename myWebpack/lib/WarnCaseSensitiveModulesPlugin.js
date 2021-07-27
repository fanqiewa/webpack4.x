
"use strict";

const CaseSensitiveModulesWarning = require("./CaseSensitiveModulesWarning");

class WarnCaseSensitiveModulesPlugin {
	apply(compiler) {
    // 注入hook - WarnCaseSensitiveModulesPlugin
		compiler.hooks.compilation.tap(
			"WarnCaseSensitiveModulesPlugin",
			compilation => {
				// 注入hook - seal 闭环
				compilation.hooks.seal.tap("WarnCaseSensitiveModulesPlugin", () => {
				  const moduleWithoutCase = new Map();
					for (const module of compilation.modules) {
						// 标识符 模块路径
						const identifier = module.identifier().toLowerCase();
						const array = moduleWithoutCase.get(identifier);
						if (array) {
							array.push(module);
						} else {
							moduleWithoutCase.set(identifier, [module]);
						}
					}
					for (const pair of moduleWithoutCase) {
						const array = pair[1];
						if (array.length > 1) {
							// 相同路径含有多个模块，添加敏感的警告 TODO
							compilation.warnings.push(new CaseSensitiveModulesWarning(array));
						}
					}
				});
			}
		);
	}
}
module.exports = WarnCaseSensitiveModulesPlugin;