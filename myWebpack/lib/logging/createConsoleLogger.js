/**
 * 日志记录
 */
"use strict";

const { LogType } = require("./Logger");


const filterToFunction = item => {
  if (typeof item === "string") {
    const regExp = new RegExp(
      `[\\\\/]${item.replace(
        /[-[\]{}()*+?.\\^$|]/g,
        "\\$&"
      )}([\\\\/]|$|!|\\?)`
    );
    return ident => regExp.test(ident);
  }
  if (item && typeof item === "object" && typeof item.test === "function") {
    return ident => item.test(ident);
  }
  if (typeof item === "function") {
    return item;
  }
  if (typeof item === "boolean") {
    return () => item;
  }
}

// 枚举类型 日志等级
const LogLevel = {
	none: 6,
	false: 6,
	error: 5,
	warn: 4,
	info: 3,
	log: 2,
	true: 2,
	verbose: 1
};

module.exports = ({ level = "info", debug = false, console }) => {
  const debugFilters = 
    typeof debug === "boolean"
      ? [() => debug]
      : ([])
        .concat(debug)
        .map(filterToFunction);
  const loglevel = Logvel[`${level}`] || 0;

  const logger = (name, type, args) => {
    // TODO
  };
  return logger;
}