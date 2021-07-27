"use strict";

module.exports = function prepareOptions(options, argv) {
	argv = argv || {};
	options = handleExport(options);
	return Array.isArray(options)
		? options.map(_options => handleFunction(_options, argv))
		: handleFunction(options, argv);
};

function handleExport(options) {
	const isES6DefaultExported =
		typeof options === "object" && options !== null && typeof options.default !== "undefined";
	// 如果传入的webpack.config.js中配置有default，则使用default中的配置
	return isES6DefaultExported ? options.default : options;
}

// 如果传入的配置是一个function，则执行这个function
function handleFunction(options, argv) {
	if (typeof options === "function") {
		options = options(argv.env, argv);
	}
	return options;
}
