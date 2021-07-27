
"use strict";

const createHash = require("./util/createHash");
const ModuleFilenameHelpers = exports;

const asRegExp = test => {
	if (typeof test === "string") {
		test = new RegExp("^" + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
	}
	return test;
};

ModuleFilenameHelpers.matchPart = (str, test) => {
	if (!test) return true;
	test = asRegExp(test);
	if (Array.isArray(test)) {
		return test.map(asRegExp).some(regExp => regExp.test(str));
	} else {
		return test.test(str);
	}
};

// 匹配对象
ModuleFilenameHelpers.matchObject = (obj, str) => {
  // test
	if (obj.test) {
		if (!ModuleFilenameHelpers.matchPart(str, obj.test)) {
			return false;
		}
	}
  // include
	if (obj.include) {
		if (!ModuleFilenameHelpers.matchPart(str, obj.include)) {
			return false;
		}
	}
  // exclude
	if (obj.exclude) {
		if (ModuleFilenameHelpers.matchPart(str, obj.exclude)) {
			return false;
		}
	}
	return true;
};
