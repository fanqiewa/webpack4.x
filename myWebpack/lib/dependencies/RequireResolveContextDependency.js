
"use strict";
const ModuleDependency = require("./ModuleDependency");
const ModuleDependencyAsId = require("./ModuleDependencyTemplateAsId");

class RequireResolveDependency extends ModuleDependency {
	// TODO
}

RequireResolveDependency.Template = ModuleDependencyAsId;

module.exports = RequireResolveDependency;
