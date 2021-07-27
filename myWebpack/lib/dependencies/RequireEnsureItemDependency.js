
"use strict";
const Dependency = require("../Dependency");

class NullDependency extends Dependency {
  // TODO
}

NullDependency.Template = class NullDependencyTemplate {
	apply() {}
};

module.exports = NullDependency;
