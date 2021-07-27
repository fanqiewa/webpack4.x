
"use strict";

const { RawSource, ReplaceSource } = require("webpack-sources");

class JavascriptGenerator {
	generate(module, dependencyTemplates, runtimeTemplate) {
    // TODO
	}

	sourceBlock(
		module,
		block,
		availableVars,
		dependencyTemplates,
		source,
		runtimeTemplate
	) {
    // TODO
	}

	sourceDependency(dependency, dependencyTemplates, source, runtimeTemplate) {
    // TODO
	}

	sourceVariables(
		variable,
		availableVars,
		dependencyTemplates,
		runtimeTemplate
	) {
    // TODO
	}

	variableInjectionFunctionWrapperStartCode(varNames) {
    // TODO
	}

	contextArgument(module, block) {
    // TODO
	}

	variableInjectionFunctionWrapperEndCode(module, varExpressions, block) {
    // TODO
	}

	splitVariablesInUniqueNamedChunks(vars) {
    // TODO
	}
}

module.exports = JavascriptGenerator;
