
"use strict";
const path = require("path");

const BasicEvaluatedExpression = require("./BasicEvaluatedExpression");
const ConstDependency = require("./dependencies/ConstDependency");
const UnsupportedFeatureWarning = require("./UnsupportedFeatureWarning");

const ParserHelpers = exports;

ParserHelpers.addParsedVariableToModule = (parser, name, expression) => {
	if (!parser.state.current.addVariable) return false;
	var deps = [];
	parser.parse(expression, {
		current: {
			addDependency: dep => {
				dep.userRequest = name;
				deps.push(dep);
			}
		},
		module: parser.state.module
	});
	parser.state.current.addVariable(name, expression, deps);
	return true;
};

ParserHelpers.requireFileAsExpression = (context, pathToModule) => {
	var moduleJsPath = path.relative(context, pathToModule);
	if (!/^[A-Z]:/i.test(moduleJsPath)) {
		moduleJsPath = "./" + moduleJsPath.replace(/\\/g, "/");
	}
	return "require(" + JSON.stringify(moduleJsPath) + ")";
}

// 常量依赖
ParserHelpers.toConstantDependency = (parser, value) => {
  return function constDependency(expr) {
		var dep = new ConstDependency(value, expr.range, false);
		dep.loc = expr.loc;
		parser.state.current.addDependency(dep);
		return true;
  }
}

ParserHelpers.toConstantDependencyWithWebpackRequire = (parser, value) => {
  return function constDependencyWithWebpackRequire(expr) {
		var dep = new ConstDependency(value, expr.range, true);
		dep.loc = expr.loc;
		parser.state.current.addDependency(dep);
		return true;
  }
}

ParserHelpers.evaluateToString = value => {
  return function stringExpression(expr) {
    // TODO
  }
}

ParserHelpers.evaluateToIdentifier = (identifier, turthy) => {
  return function identifierExpression(expr) {
    // TODO
  }
}

ParserHelpers.expressionIsUnsupported = (parser, message) => {
  return function unsupportedExpression(expr) {
    // TODO
  }
}

// 认证通过
ParserHelpers.approve = function approve() {
	return true;
}
