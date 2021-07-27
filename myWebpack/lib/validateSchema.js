/**
 * 验证方案
 */
"use strict";

// 适用于 Node.js 和浏览器的最快 JSON 验证器。
const Ajv = require("ajv");
const ajv = new Ajv({
	errorDataPath: "configuration",
	allErrors: true,
	verbose: true
});

const validateSchema = (schema, options) => {
  if (Array.isArray(options)) {
    // TODO
  } else {
    return validateObject(schema, options);
  }
}

// 校验对象
const validateObject = (schema, options) => {
  const validate = ajv.compile(schema);
  const valid = validate(options);
  return valid ? [] : filterErrors(validate.errors);
}

// 过滤错误
const filterErrors = errors => {
  let newErrors = [];
  // TODO
}

module.exports = validateSchema;