

"use strict";

const mergeCache = new WeakMap();

// 灵活的缓存合并
const cachedCleverMerge = (first, second) => {
	let innerCache = mergeCache.get(first);
	if (innerCache === undefined) {
		innerCache = new WeakMap();
		mergeCache.set(first, innerCache);
	}
	const prevMerge = innerCache.get(second);
	if (prevMerge !== undefined) return prevMerge;
	const newMerge = cleverMerge(first, second);
	innerCache.set(second, newMerge);
	return newMerge;
};

// 灵活的合并
const cleverMerge = (first, second) => {
	const newObject = Object.assign({}, first);
	for (const key of Object.keys(second)) {
		if (!(key in newObject)) {
			newObject[key] = second[key];
			continue;
		}
		const secondValue = second[key];
		if (!Array.isArray(secondValue)) {
			newObject[key] = secondValue;
			continue;
		}
		const firstValue = newObject[key];
		if (Array.isArray(firstValue)) {
			const newArray = [];
			for (const item of secondValue) {
				if (item === "...") {
					for (const item of firstValue) {
						newArray.push(item);
					}
				} else {
					newArray.push(item);
				}
			}
			newObject[key] = newArray;
		} else {
			newObject[key] = secondValue;
		}
	}
	return newObject;
};

exports.cachedCleverMerge = cachedCleverMerge;
exports.cleverMerge = cleverMerge;