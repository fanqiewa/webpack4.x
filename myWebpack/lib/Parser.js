
"use strict";

// 一个用 JavaScript 编写的小巧、快速的 JavaScript 解析器。
const acorn = require("acorn");
const { Tapable, SyncBailHook, HookMap } = require("tapable");
const util = require("util");
const vm = require("vm");
const BasicEvaluatedExpression = require("./BasicEvaluatedExpression");
const StackedSetMap = require("./util/StackedSetMap");

const acornParser = acorn.Parser;

class Parser extends Tapable {
  constructor(options, sourceType = "auto") {
    super();
    this.hooks = {
			evaluateTypeof: new HookMap(() => new SyncBailHook(["expression"])),
			evaluate: new HookMap(() => new SyncBailHook(["expression"])),
			evaluateIdentifier: new HookMap(() => new SyncBailHook(["expression"])),
			evaluateDefinedIdentifier: new HookMap(
				() => new SyncBailHook(["expression"])
			),
			evaluateCallExpressionMember: new HookMap(
				() => new SyncBailHook(["expression", "param"])
			),
			statement: new SyncBailHook(["statement"]),
			statementIf: new SyncBailHook(["statement"]),
			label: new HookMap(() => new SyncBailHook(["statement"])),
			import: new SyncBailHook(["statement", "source"]),
			importSpecifier: new SyncBailHook([
				"statement",
				"source",
				"exportName",
				"identifierName"
			]),
			export: new SyncBailHook(["statement"]),
			exportImport: new SyncBailHook(["statement", "source"]),
			exportDeclaration: new SyncBailHook(["statement", "declaration"]),
			exportExpression: new SyncBailHook(["statement", "declaration"]),
			exportSpecifier: new SyncBailHook([
				"statement",
				"identifierName",
				"exportName",
				"index"
			]),
			exportImportSpecifier: new SyncBailHook([
				"statement",
				"source",
				"identifierName",
				"exportName",
				"index"
			]),
			varDeclaration: new HookMap(() => new SyncBailHook(["declaration"])),
			varDeclarationLet: new HookMap(() => new SyncBailHook(["declaration"])),
			varDeclarationConst: new HookMap(() => new SyncBailHook(["declaration"])),
			varDeclarationVar: new HookMap(() => new SyncBailHook(["declaration"])),
			canRename: new HookMap(() => new SyncBailHook(["initExpression"])),
			rename: new HookMap(() => new SyncBailHook(["initExpression"])),
			assigned: new HookMap(() => new SyncBailHook(["expression"])),
			assign: new HookMap(() => new SyncBailHook(["expression"])),
			typeof: new HookMap(() => new SyncBailHook(["expression"])),
			importCall: new SyncBailHook(["expression"]),
			call: new HookMap(() => new SyncBailHook(["expression"])),
			callAnyMember: new HookMap(() => new SyncBailHook(["expression"])),
			new: new HookMap(() => new SyncBailHook(["expression"])),
			expression: new HookMap(() => new SyncBailHook(["expression"])),
			expressionAnyMember: new HookMap(() => new SyncBailHook(["expression"])),
			expressionConditionalOperator: new SyncBailHook(["expression"]),
			expressionLogicalOperator: new SyncBailHook(["expression"]),
			program: new SyncBailHook(["ast", "comments"])

    }
		const HOOK_MAP_COMPAT_CONFIG = {
			evaluateTypeof: /^evaluate typeof (.+)$/,
			evaluateIdentifier: /^evaluate Identifier (.+)$/,
			evaluateDefinedIdentifier: /^evaluate defined Identifier (.+)$/,
			evaluateCallExpressionMember: /^evaluate CallExpression .(.+)$/,
			evaluate: /^evaluate (.+)$/,
			label: /^label (.+)$/,
			varDeclarationLet: /^var-let (.+)$/,
			varDeclarationConst: /^var-const (.+)$/,
			varDeclarationVar: /^var-var (.+)$/,
			varDeclaration: /^var (.+)$/,
			canRename: /^can-rename (.+)$/,
			rename: /^rename (.+)$/,
			typeof: /^typeof (.+)$/,
			assigned: /^assigned (.+)$/,
			assign: /^assign (.+)$/,
			callAnyMember: /^call (.+)\.\*$/,
			call: /^call (.+)$/,
			new: /^new (.+)$/,
			expressionConditionalOperator: /^expression \?:$/,
			expressionAnyMember: /^expression (.+)\.\*$/,
			expression: /^expression (.+)$/
		};
		this._pluginCompat.tap("Parser", options => {
      // TODO
		});
		this.options = options;
		this.sourceType = sourceType;
		this.scope = undefined;
		this.state = undefined;
		this.comments = undefined;
		this.initializeEvaluating();
  }

  // 初始化eval
  initializeEvaluating() {
    this.hooks.evaluate.for("Literal").tap("Parser", expr => {
			switch (typeof expr.value) {
				case "number":
					// TODO
				case "string":
					return new BasicEvaluatedExpression()
						.setString(expr.value)
						.setRange(expr.range);
					// TODO
			}
    });
    this.hooks.evaluate.for("LogicalExpression").tap("Parser", expr => {
      // TODO
    });
    this.hooks.evaluate.for("BinaryExpression").tap("Parser", expr => {
      // TODO
    });
    this.hooks.evaluate.for("UnaryExpression").tap("Parser", expr => {
      // TODO
    });
    this.hooks.evaluateTypeof.for("undefined").tap("Parser", expr => {
      // TODO
    });
		// 注入hook - evaluate eval执行函数
    this.hooks.evaluate.for("Identifier").tap("Parser", expr => {
			// 函数名
			const name = this.scope.renames.get(expr.name) || expr.name;
			if (!this.scope.definitions.has(expr.name)) {
				// TODO
			} else {
				const hook = this.hooks.evaluateDefinedIdentifier.get(name);
				if (hook !== undefined) {
					return hook.call(expr);
				}
			}
    });
    this.hooks.evaluate.for("ThisExpression").tap("Parser", expr => {
      // TODO
    });
    this.hooks.evaluate.for("MemberExpression").tap("Parser", expression => {
			let exprName = this.getNameForExpression(expression);
			if (exprName) {
				if (exprName.free) {
					const hook = this.hooks.evaluateIdentifier.get(exprName.name);
					if (hook !== undefined) {
						// TODO
					}
					return new BasicEvaluatedExpression()
						.setIdentifier(exprName.name)
						.setRange(expression.range);
				} else {
					// TODO
				}
			}
    });
    this.hooks.evaluate.for("CallExpression").tap("Parser", expr => {
			if (expr.callee.type !== "MemberExpression") return;
			if (
				expr.callee.property.type !==
				(expr.callee.computed ? "Literal" : "Identifier")
			)
				return;
			const param = this.evaluateExpression(expr.callee.object);
			if (!param) return;
			const property = expr.callee.property.name || expr.callee.property.value;
			const hook = this.hooks.evaluateCallExpressionMember.get(property);
			if (hook !== undefined) {
				return hook.call(expr, param);
			}
    });
    this.hooks.evaluateCallExpressionMember
      .for("replace")
      .tap("Parser", (expr, param) => {
        // TODO
      });

    const getSimplifiedTemplateResult = (kind, templateLiteralExpr) => {
      // TODO
    }
    this.hooks.evaluate.for("TemplateLiteral").tap("Parser", node => {
      // TODO
    });
    this.hooks.evaluate.for("TaggedTemplateExpression").tap("Parser", node => {
      // TODO
    });
    
		this.hooks.evaluateCallExpressionMember
      .for("concat")
      .tap("Parser", (expr, param) => {
        // TODO
      });
    this.hooks.evaluateCallExpressionMember
			.for("split")
			.tap("Parser", (expr, param) => {
        // TODO
      });
    this.hooks.evaluate.for("ConditionalExpression").tap("Parser", expr => {
      // TODO
    });
    this.hooks.evaluate.for("ArrayExpression").tap("Parser", expr => {
      // TODO
    });
  }

	// 前置声明变量
	prewalkStatements(statements) {
		for (let index = 0, len = statements.length; index < len; index++) {
			const statement = statements[index];
			this.prewalkStatement(statement);
		}
	}
	// 函数体内容
	blockPrewalkStatements(statements) {
		for (let index = 0, len = statements.length; index < len; index++) {
			const statement = statements[index];
			this.blockPrewalkStatement(statement);
		}
	}
	
	walkStatements(statements) {
		for (let index = 0, len = statements.length; index < len; index++) {
			const statement = statements[index];
			this.walkStatement(statement);
		}
	}
	blockPrewalkStatement(statement) {
		switch (statement.type) {
			case "VariableDeclaration":
				this.blockPrewalkVariableDeclaration(statement);
				break;
		}
	}
	blockPrewalkVariableDeclaration(statement) {
		if (statement.kind === "var") return;
		const hookMap =
			statement.kind === "const"
				? this.hooks.varDeclarationConst
				: this.hooks.varDeclarationLet;
		this._prewalkVariableDeclaration(statement, hookMap);
	}
	_prewalkVariableDeclaration(statement, hookMap) {
		for (const declarator of statement.declarations) {
			switch (declarator.type) {
				case "VariableDeclarator": {
					this.enterPattern(declarator.id, (name, decl) => {
						let hook = hookMap.get(name);
						if (hook === undefined || !hook.call(decl)) {
							hook = this.hooks.varDeclaration.get(name);
							if (hook === undefined || !hook.call(decl)) {
								this.scope.renames.set(name, null);
								this.scope.definitions.add(name);
							}
						}
					});
					break;
				}
			}
		}
	}
	enterPattern(pattern, onIdent) {
		if (!pattern) return;
		switch (pattern.type) {
			case "Identifier":
				this.enterIdentifier(pattern, onIdent);
				break;
		}
	}
	enterIdentifier(pattern, onIdent) {
		onIdent(pattern.name, pattern);
	}


	// 处理前置声明代码
	prewalkStatement(statement) {
		switch (statement.type) {
			case "BlockStatement" /* 处理块状代码 */:
				this.prewalkBlockStatement(statement);
				break;
			case "ImportDeclaration": /* 导入模块代码 */
				this.prewalkImportDeclaration(statement);
				break;
			case "FunctionDeclaration" /* 函数定义模块代码 */:
				this.prewalkFunctionDeclaration(statement);
				break;
			case "VariableDeclaration" /* var 声明的代码 */:
				this.prewalkVariableDeclaration(statement);
				break;
		}
	}
	prewalkVariableDeclaration(statement) {
		// 声明类型 var let const
		if (statement.kind !== "var") return;
		this._prewalkVariableDeclaration(statement, this.hooks.varDeclarationVar);
	}
	prewalkBlockStatement(statement) {
		this.prewalkStatements(statement.body);
	}

	// 前置函数定义模块
	prewalkFunctionDeclaration(statement) {
		if (statement.id) {
			/// 重置函数名为null
			this.scope.renames.set(statement.id.name, null);
			// 添加定义函数名
			this.scope.definitions.add(statement.id.name);
		}
	}

	// 处理前置声明导入模块代码
	prewalkImportDeclaration(statement) {
		// e.g. import util from "./utils"
		// => source = "./utils"
		const source = statement.source.value;
		// 触发hook - import
		this.hooks.import.call(statement, source);
		// 分类符
		// e.g. import util from "./utils"
		// => name = util
		for (const specifier of statement.specifiers) {
			const name = specifier.local.name;
			this.scope.renames.set(name, null);
			this.scope.definitions.add(name);
			switch (specifier.type) {
				case "ImportDefaultSpecifier": /* 导入默认模块, 当导出类型为default时 */
					this.hooks.importSpecifier.call(statement, source, "default", name);
					break;
			}
		}
	}
	blockPrewalkStatements(statement) {
		switch (statement.type) {
			// TODO
		}
	}
	// 空间声明
	walkStatement(statement) {
		if (this.hooks.statement.call(statement) !== undefined) return;
		switch (statement.type) {
			case "BlockStatement":
				this.walkBlockStatement(statement);
				break;
			case "ExpressionStatement": /* 表达式代码 */
				this.walkExpressionStatement(statement);
				break;
			case "FunctionDeclaration": /* 处理函数内部模块代码 */
				this.walkFunctionDeclaration(statement);
				break;
			case "VariableDeclaration":
				this.walkVariableDeclaration(statement);
				break;
		}
	}

	// 变量声明
	walkVariableDeclaration(statement) {
		for (const declarator of statement.declarations) {
			switch (declarator.type) {
				case "VariableDeclarator": {
					const renameIdentifier =
						declarator.init && this.getRenameIdentifier(declarator.init);
					if (renameIdentifier && declarator.id.type === "Identifier") {
						const hook = this.hooks.canRename.get(renameIdentifier);
						if (hook !== undefined && hook.call(declarator.init)) {
							// renaming with "var a = b;"
							const hook = this.hooks.rename.get(renameIdentifier);
							if (hook === undefined || !hook.call(declarator.init)) {
								this.scope.renames.set(
									declarator.id.name,
									this.scope.renames.get(renameIdentifier) || renameIdentifier
								);
								this.scope.definitions.delete(declarator.id.name);
							}
							break;
						}
					}
					this.walkPattern(declarator.id);
					if (declarator.init) this.walkExpression(declarator.init);
					break;
				}
			}
		}
	}
	// 获取重命名标识符
	getRenameIdentifier(expr) {
		const result = this.evaluateExpression(expr);
		if (result && result.isIdentifier()) {
			return result.identifier;
		}
	}
	walkBlockStatement(statement) {
		this.inBlockScope(() => {
			const body = statement.body;
			this.blockPrewalkStatements(body);
			this.walkStatements(body);
		});
	}

	// 在块级作用域中处理函数
	inBlockScope(fn) {
		const oldScope = this.scope;
		this.scope = {
			topLevelScope: oldScope.topLevelScope,
			inTry: oldScope.inTry,
			inShorthand: false,
			isStrict: oldScope.isStrict,
			isAsmJs: oldScope.isAsmJs,
			definitions: oldScope.definitions.createChild(),
			renames: oldScope.renames.createChild()
		};

		fn();

		this.scope = oldScope;
	}
	walkFunctionDeclaration(statement) {
		// 是否为顶级作用域
		const wasTopLevel = this.scope.topLevelScope;
		this.scope.topLevelScope = false;
		this.inFunctionScope(true, statement.params, () => {
			for (const param of statement.params) {
				this.walkPattern(param);
			}
			if (statement.body.type === "BlockStatement") {
				// 如果函数内部有模块代码
				this.detectMode(statement.body.body);
				this.prewalkStatement(statement.body);
				this.walkStatement(statement.body);
			} else {
				this.walkExpression(statement.body);
			}
		});
		this.scope.topLevelScope = wasTopLevel;
	}
	/**
	 * 处理函数作用域
	 * @param {*} hasThis 是否含有this
	 * @param {*} params 函数的形参
	 * @param {*} fn 回调函数
	 */
	inFunctionScope(hasThis, params, fn) {
		const oldScope = this.scope;
		this.scope = {
			topLevelScope: oldScope.topLevelScope,
			inTry: false,
			inShorthand: false,
			isStrict: oldScope.isStrict,
			isAsmJs: oldScope.isAsmJs,
			definitions: oldScope.definitions.createChild(),
			renames: oldScope.renames.createChild()
		}

		if (hasThis) {
			this.scope.renames.set("this", null);
		}
		this.enterPatterns(params, ident => {
			this.scope.renames.set(ident, null);
			this.scope.definitions.add(ident);
		});

		fn();

		this.scope = oldScope;
	}

	enterPatterns(patterns, onIdent) {
		for (const pattern of patterns) {
			// TODO
		}
	}


	walkExpressionStatement(statement) {
		this.walkExpression(statement.expression);
	}

	walkExpressions(expressions) {
		for (const expression of expressions) {
			if (expression) {
				this.walkExpression(expression);
			}
		}
	}

	walkExpression(expression) {
		switch (expression.type) {
			case "BinaryExpression":
				this.walkBinaryExpression(expression);
			case "CallExpression": /* 执行函数类型 */
				this.walkCallExpression(expression);
				break;
			case "MemberExpression":
				this.walkMemberExpression(expression);
				break;
			case "Identifier": /* 标识符 */
				this.walkIdentifier(expression);
		}
	}
	walkLeftRightExpression(expression) {
		this.walkExpression(expression.left);
		this.walkExpression(expression.right);
	}
	walkBinaryExpression(expression) {
		this.walkLeftRightExpression(expression);
	}

	walkCallExpression(expression) {
		if (
			expression.callee.type === "MemberExpression" &&
			expression.callee.object.type === "FunctionExpression" &&
			!expression.callee.computed &&
			(expression.callee.property.name === "call" ||
				expression.callee.property.name === "bind") &&
			expression.arguments.length > 0
		) {
			// TODO
		} else if (expression.callee.type === "FunctionExpression") {
			// TODO
		} else if (expression.callee.type === "Import") {
			// TODO
		} else {
			const callee = this.evaluateExpression(expression.callee);
			if (callee.isIdentifier()) {
				const callHook = this.hooks.call.get(callee.identifier);
				if (callHook !== undefined) {
					// TODO
				}
				let identifier = callee.identifier.replace(/\.[^.]+$/, "");
				if (identifier !== callee.identifier) {
					const callAnyHook = this.hooks.callAnyMember.get(identifier);
					if (callAnyHook !== undefined) {
						let result = callAnyHook.call(expression);
						if (result === true) return;
					}
				}
			}
			// callee 执行当前函数对象
			if (expression.callee) this.walkExpression(expression.callee);
			// arguments
			if (expression.arguments) this.walkExpressions(expression.arguments);
		}
	}

	walkMemberExpression(expression) {
		const exprName = this.getNameForExpression(expression);
		if (exprName && exprName.free) {
			const expressionHook = this.hooks.expression.get(exprName.name);
			if (expressionHook !== undefined) {
				const result = expressionHook.call(expression);
				if (result === true) return;
			}
			const expressionAnyMemberHook = this.hooks.expressionAnyMember.get(
				exprName.nameGeneral
			);
			if (expressionAnyMemberHook !== undefined) {
				const result = expressionAnyMemberHook.call(expression);
				if (result === true) return;
			}
		}
	}
	// 空间标识符
	walkIdentifier(expression) {
		if (!this.scope.definitions.has(expression.name)) {
			// 触发hook - expression
			// e.g. DefinePlugin中注入的expression
			const hook = this.hooks.expression.get(
				this.scope.renames.get(expression.name) || expression.name
			);
			if (hook !== undefined) {
				const result = hook.call(expression);
				if (result === true) return;
			}
		}
	}

	// eval 执行函数
	// eval将字符串当成函数来执行
	evaluateExpression(expression) {
		try {
			const hook = this.hooks.evaluate.get(expression.type);
			if (hook !== undefined) {
				const result = hook.call(expression);
				if (result !== undefined) {
					if (result) {
						result.setExpression(expression);
					}
					return result;
				}
			}
		} catch (e) {
			console.warn(e);
		}
		return new BasicEvaluatedExpression()
			.setRange(expression.range)
			.setExpression(expression);
	}

	// 解析源内容
	parse(source, initialState) {
		let ast;
		let comments;
		if (typeof source === "object" && source !== null) {
			ast = source;
			comments = source.comments;
		} else {
			comments = [];
			ast = Parser.parse(source, {
				sourceType: this.sourceType,
				onComment: comments
			});
		}

		const oldScope = this.scope;
		const oldState = this.state;
		const oldComments = this.comments;
		this.scope = {
			topLevelScope: true,
			inTry: false,
			inShorthand: false,
			isStrict: false,
			isAsmJs: false,
			definitions: new StackedSetMap(), // 定义
			renames: new StackedSetMap() // 重命名 导入模块名称
		}
		const state = (this.state = initialState || {});
		this.comments = comments;
		// 进度
		if (this.hooks.program.call(ast, comments) === undefined) {
			// 检查模式
			this.detectMode(ast.body);
			// 变量声明提升
			this.prewalkStatements(ast.body);
			// 函数体
			this.blockPrewalkStatements(ast.body);
			// 
			this.walkStatements(ast.body);
		}
		this.scope = oldScope;
		this.state = oldState;
		this.comments = oldComments;
		return state;
	}

	getNameForExpression(expression) {
		let expr = expression;
		const exprName = [];
		while (
			expr.type === "MemberExpression" &&
			expr.property.type === (expr.computed ? "Literal" : "Identifier")
		) {
			exprName.push(expr.computed ? expr.property.value : expr.property.name);
			expr = expr.object;
		}
		let free;
		if (expr.type === "Identifier") {
			free = !this.scope.definitions.has(expr.name);
			exprName.push(this.scope.renames.get(expr.name) || expr.name);
		} else if (
			expr.type === "ThisExpression" &&
			this.scope.renames.get("this")
		) {
			// TODO
		} else if (expr.type === "ThisExpression") {
			// TODO
		} else {
			return null;
		}
		let prefix = "";
		for (let i = exprName.length - 1; i >= 2; i--) {
			prefix += exprName[i] + ".";
		}
		if (exprName.length > 1) {
			prefix += exprName[1];
		}
		const name = prefix ? prefix + "." + exprName[0] : exprName[0];
		const nameGeneral = prefix;
		return {
			name,
			nameGeneral,
			free
		};
	}

	// 私有方法，解析
	static parse(code, options) {
		const type = options ? options.sourceType : "module";
		const parserOptions = Object.assign(
			Object.create(null),
			defaultParserOptions,
			options
		);

		if (type === "auto") {
			parserOptions.sourceType = "module";
		} else if (parserOptions.sourceType === "script") {
			// TODO
		}

		let ast;
		let error;
		let threw = false;
		try {
			ast = acornParser.parse(code, parserOptions);
		} catch (e) {
			error = e;
			threw = true;
		}

		if (threw && type === "auto") {
			// TODO
		}

		if (threw) {
			throw error;
		}

		return ast;
	}

	// 检测模式
	detectMode(statements) {
		const isLiteral = 
			statements.length >= 1 &&
			statements[0].type === "ExpressionStatement" &&
			statements[0].expression.type === "Literal";
		if (isLiteral && statements[0].expression.value === "use strict") {
			// TODO
		}
		if (isLiteral && statements[0].expression.value === "use asm") {
			// TODO
		}
	}

	// 评价
	evaluate(source) {
		const ast = Parser.parse("(" + source + ")", {
			sourceType: this.sourceType,
			locations: false
		});

		if (ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement") {
			throw new Error("evaluate: Source is not a expression");
		}

		return this.evaluateExpression(ast.body[0].expression);
	}
}