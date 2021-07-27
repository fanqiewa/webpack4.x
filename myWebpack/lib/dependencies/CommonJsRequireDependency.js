
"use strict";
const ModuleDependency = require("./ModuleDependency");
const ModuleDependencyTemplateAsId = require("./ModuleDependencyTemplateAsId");

class CommonJsRequireDependency extends ModuleDependency {
	// TODO
}

CommonJsRequireDependency.Template = ModuleDependencyTemplateAsId;

module.exports = CommonJsRequireDependency;
