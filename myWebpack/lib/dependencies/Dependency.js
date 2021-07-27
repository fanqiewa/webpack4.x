
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
}