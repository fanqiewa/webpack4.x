
/**
 * 空依赖
 */
"use strict";
const Dependency = require("../Dependency");

class NullDependency extends Dependency {
  get type() {
    return "null";
  }

  updateHash() {}
}

NullDependency.Template = class NullDependencyTemplate {
  apply() {}
};

module.exports = NullDependency;