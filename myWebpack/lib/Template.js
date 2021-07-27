
const COMMENT_END_REGEX = /\*\//g;

class Template {
  // 字符串转成注释
	static toComment(str) {
		if (!str) return "";
		return `/*! ${str.replace(COMMENT_END_REGEX, "* /")} */`;
	}
}
module.exports = Template;
