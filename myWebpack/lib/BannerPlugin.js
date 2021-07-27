/**
 * 主要用于对打包好的js文件的最开始处添加版权声明
 */
"use strict";

const { ConcatSource } = require("webpack-sources");
const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");
const Template = require("./Template");

const validateOptions = require("schema-utils");
const schema = require("../schemas/plugins/BannerPlugin.json");

// 包裹成注释
const wrapComment = str => {
  if (!str.includes("\n")) {
    return Template.toComment(str);
  }
  return `/*!\n * ${str
    .replace(/\*\//g, "* /")
    .split("\n")
    .join("\n * ")}\n */`;
}

/*
  e.g. 
  module.exports = {
    plugins: [
        new webpack.BannerPlugin("author by fanqiewa")
    ]
  }
*/
class BannerPlugin {
  constructor(options) {
    if (arguments.length > 1) {
      throw new Error(
        "BannerPlugin only takes one argument (pass an options object)"
      );
    }

    validateOptions(schema, options, "Banner Plugin");

    if (typeof options === "string" || typeof options === "function") {
      options = {
        banner: options
      }
    }

    this.options = options;

    const bannerOption = options.banner;
    if (typeof bannerOption === "function") {
      const getBanner = bannerOption;
      this.banner = this.options.raw
        ? getBanner
        : data => wrapComment(getBanner(data));
    } else {
      const banner = this.options.raw
        ? bannerOption
        : wrapComment(bannerOption);
      this.banner = () => banner;
    }
  }

  apply(compiler) {
		const options = this.options;
		const banner = this.banner;
		const matchObject = ModuleFilenameHelpers.matchObject.bind(
			undefined,
			options
		);

    compiler.hooks.compilation.tap("BannerPlugin", compilation => {
      compilation.hooks.optimizeChunkAssets.tap("BannerPlugin", chunks => {
        for (const chunk of chunks) {
          // entryOnly只会加在入口文件
          if (options.entryOnly && !chunk.canBeInitial()) {
            continue;
          }

          for (const file of chunk.files) {
            if (!matchObject(file)) {
              continue;
            }

            let query = "";
            // 文件名（可能包含路径）
            let filename = file;
            const hash = compilation.hash;
            const querySplit = filename.indexOf("?");

            if (querySplit >= 0) {
              query = filename.substr(querySplit);
              filename = filename.substr(0, querySplit);
            }

            const lastSlashIndex = filename.lastIndexOf("/");

            // 文件名
            const basename =
              lastSlashIndex === -1
                ? filename
                : filename.substr(lastSlashIndex + 1);

            const data = {
              hash,
              chunk,
              filename,
              basename,
              query
            };

            const comment = compilation.getPath(banner(data), data);

            compilation.updateAsset(
              file,
              // 拼接字符
              old => new ConcatSource(comment, "\n", old)
            );
          }
        }
      });
    });
  }
}

module.exports = BannerPlugin;