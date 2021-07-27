
"use strict";

const ImportContextDependency = require("./ImportContextDependency");
const ImportWeakDependency = require("./ImportWeakDependency");
const ImportDependenciesBlock = require("./ImportDependenciesBlock");
const ImportEagerDependency = require("./ImportEagerDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const UnsupportedFeatureWarning = require("../UnsupportedFeatureWarning");
const CommentCompilationWarning = require("../CommentCompilationWarning");

class ImportParserPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(parser) {
		parser.hooks.importCall.tap("ImportParserPlugin", expr => {
      // TODO
		});
	}
}

module.exports = ImportParserPlugin;
