/**
 * Eval基础类
 */
"use strict";

const TypeUnknown = 0;
const TypeNull = 1;
const TypeString = 2;
const TypeNumber = 3;
const TypeBoolean = 4;
const TypeRegExp = 5;
const TypeConditional = 6;
const TypeArray = 7;
const TypeConstArray = 8;
const TypeIdentifier = 9;
const TypeWrapped = 10;
const TypeTemplateString = 11;

class BasicEvaluatedExpression {
	constructor() {
		this.type = TypeUnknown;
		this.range = null;
		this.falsy = false;
		this.truthy = false;
		this.bool = null;
		this.number = null;
		this.regExp = null;
		this.string = null;
		this.quasis = null;
		this.parts = null;
		this.array = null;
		this.items = null;
		this.options = null;
		this.prefix = null;
		this.postfix = null;
		this.wrappedInnerExpressions = null;
		this.expression = null;
	}
  
	setIdentifier(identifier) {
		this.type = TypeIdentifier;
		this.identifier = identifier;
		return this;
	}

	isIdentifier() {
		return this.type === TypeIdentifier;
	}
  
	// 设置范围
	setRange(range) {
		this.range = range;
		return this;
	}

	setExpression(expression) {
		this.expression = expression;
		return this;
	}

	// 设置字符串
	setString(string) {
		this.type = TypeString;
		this.string = string;
		return this;
	}

}