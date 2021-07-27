
"use strict";
const path = require("path");

exports.contextify = (context, request) => {
	return request
		.split("!")
		.map(r => {
			const splitPath = r.split("?", 2);
			if (/^[a-zA-Z]:\\/.test(splitPath[0])) {
				splitPath[0] = path.win32.relative(context, splitPath[0]);
				if (!/^[a-zA-Z]:\\/.test(splitPath[0])) {
					splitPath[0] = splitPath[0].replace(/\\/g, "/");
				}
			}
			if (/^\//.test(splitPath[0])) {
				splitPath[0] = path.posix.relative(context, splitPath[0]);
			}
			if (!/^(\.\.\/|\/|[a-zA-Z]:\\)/.test(splitPath[0])) {
				splitPath[0] = "./" + splitPath[0];
			}
			return splitPath.join("?");
		})
		.join("!");
}