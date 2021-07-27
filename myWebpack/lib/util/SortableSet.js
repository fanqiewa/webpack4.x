
"use strict";

class SortableSet extends Set {
  constructor(initialIterable, defaultSort) {
    super(initialIterable);
    this._sortFn = defaultSort;
    this._lastActiveSortFn = null;
    this._cache = undefined;
    this._cacheOrderIndependent = undefined;
  }
  // 添加
	add(value) {
		this._lastActiveSortFn = null;
		this._invalidateCache();
		this._invalidateOrderedCache();
		super.add(value);
		return this;
	}
	sortWith(sortFn) {
		if (this.size <= 1 || sortFn === this._lastActiveSortFn) {
			return;
		}

		const sortedArray = Array.from(this).sort(sortFn);
		super.clear();
		for (let i = 0; i < sortedArray.length; i += 1) {
			super.add(sortedArray[i]);
		}
		this._lastActiveSortFn = sortFn;
		this._invalidateCache();
	}
	sort() {
		this.sortWith(this._sortFn);
	}


  // 无效的缓存
	_invalidateCache() {
		if (this._cache !== undefined) {
			this._cache.clear();
		}
	}
	_invalidateOrderedCache() {
		if (this._cacheOrderIndependent !== undefined) {
			this._cacheOrderIndependent.clear();
		}
	}
}

module.exports = SortableSet;