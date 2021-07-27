
/**
 * 默认options
 */

"use strict";

// 获取属性
const getProperty = (obj, path) => {
  let name = path.split(".");
  for (let i = 0; i < name.length - 1; i++) {
    obj = obj[name[i]];
    if (typeof obj !== "object" || !obj || Array.isArray(obj)) return;
  }
  return obj[name.pop()];
}

// 设置属性
const setProperty = (obj, path, value) => {
  let name = path.split(".");
  for (let i = 0; i < name.length - 1; i++) {
    if (typeof obj[name[i]] !== "object" && obj[name[i]] !== undefined) return;
    if (Array.isArray(obj[name[i]])) return;
    if (!obj[name[i]]) obj[name[i]] = {};
    obj = obj[name[i]];
  }
  obj[name.pop()] = value;
}

class OptionsDefaulter {
  constructor() {
    this.defaults = {};
    this.config = {};
  }

  // 处理options
  process(options) {
    options = Object.assign({}, options);
    for (let name in this.defaults) {
      // 用webpack默认的options和程序员传递的options进行比较
      switch (this.config[name]) {
        /**
         * 如果未指定，且当前值为“未定义”，则将指定默认值
         */
        case undefined:
          if (getProperty(options, name) === undefined) {
            setProperty(options, name, this.defaults[name]);
          }
          break;
        case "call":
          setProperty(
            options,
            name,
            this.defaults[name].call(this, getProperty(options, name), options)
          );
          break;
        case "make":
          if (getProperty(options, name) === undefined) {
            setProperty(options, name, this.defaults[name].call(this, options));
          }
          break;
        // 附加
        case "append": {
          let oldValue = getProperty(options, name);
          if (!Array.isArray(oldValue)) {
            oldValue = [];
          }
          oldValue.push(...this.defaults[name]);
          setProperty(options, name, oldValue);
          break;
        }
        default:
          throw new Error(
            "OptionsDefaulter cannot process " + this.config[name]
          );
      }
    }
		return options;
  }

  set(name, config, def) {
    if (def !== undefined) {
      // 如果传递了三个参数 
      this.defaults[name] = def;
      this.config[name] = config;
    } else {
      this.defaults[name] = config;
      delete this.config[name]; // 删除config中的属性      
    }
  }
}

module.exports = OptionsDefaulter;