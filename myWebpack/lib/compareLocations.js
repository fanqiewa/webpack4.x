
"use strict";

module.exports = (a, b) => {
  if (typeof a === "string") {
		if (typeof b === "string") {
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		} else if (typeof b === "object") {
			return 1;
		} else {
			return 0;
		}
  } else if (typeof a === "object") {
    if (typeof b === "string") {
			return -1;
    } else if (typeof b === "object") {
      if ("start" in a && "start" in b) {
        const ap = a.start;
        const bp = b.start;
        if (ap.line < bp.line) return -1;
				if (ap.line > bp.line) return 1;
				if (ap.column < bp.column) return -1;
				if (ap.column > bp.column) return 1;
      }
			if ("name" in a && "name" in b) {
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
			}
			if ("index" in a && "index" in b) {
				if (a.index < b.index) return -1;
				if (a.index > b.index) return 1;
			}
			return 0;
    } else {
			return 0;
		}
  }
}