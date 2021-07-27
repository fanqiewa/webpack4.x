/**
 * 该插件会根据模块的相对路径生成一个四位数的hash作为模块id, 建议用于生产环境。
 */
"use strict";
const createHash = require("./util/createHash");

const validateOptions = require("schema-utils");
const schema = require("../schemas/plugins/HashedModuleIdsPlugin.json");

class HashedModuleIdsPlugin {
  constructor(options) {
    if (!options) options = {};

    // 校验参数
    validateOptions(schema, options, "Hashed Module Ids Plugin");

    this.options = Object.assign(
      {
        context: null,
        hashFunction: "md4",
        hashDigest: "base64",
        hashDigestLength: 4
      },
      options
    );
  }

  apply(compiler) {
    const options = this.options;
    compiler.hooks.compilation.tap("HashedModuleIdsPlugin", compilation => {
      const usedIds = new Set();
      compilation.hooks.beforeModuleIds.tap(
        "HashedModuleIdsPlugin",
        modules => {
          for (const module of modules) {
            if (module.id === null && module.libIdent) {
              const id = module.libIdent({
                context: this.options.context || compiler.options.context
              });
              const hash = createHash(options.hashFunction);
              hash.update(id);
							const hashId = (hash.digest(
								options.hashDigest
							));
							let len = options.hashDigestLength;
							while (usedIds.has(hashId.substr(0, len))) len++;
              // 将模块id置成hash值
							module.id = hashId.substr(0, len);
							usedIds.add(module.id);
            }
          }
        }
      );
    });
  }
}