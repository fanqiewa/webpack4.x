/**
 * 依赖主类
 */
"use strict";

const util = require("util");
const compareLocations = require("./compareLocations");
const DependencyReference = require("./dependencies/DependencyReference");

class Dependency {
  constructor() {
    this.module = null;
    this.weak = false;
    this.optional = false;
    this.loc = undefined;
  }

  // 获取依赖引用
	getReference() {
		if (!this.module) return null;
		return new DependencyReference(this.module, true, this.weak);
	}

  // exports 获取导出信息
  getExports() {
    return null;
  }

  // warning
  getWarnings() {
    return null;
  }

  // error
  getErrors() {
    return null;
  }
}