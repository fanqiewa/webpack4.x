
/**
 * const 声明依赖
 */
"use strict";
const NullDependency = require("./NullDependency");

class ConstDependency extends NullDependency {
  constructor(expression, range, requireWebpackRequire) {
    super();
    this.expression = expression;
    this.range = range;
    this.requireWebpackRequire = requireWebpackRequire;
  }
  
}

ConstDependency.Template = class ConstDependencyTemplate {
  // TODO
};

module.exports = ConstDependency;
