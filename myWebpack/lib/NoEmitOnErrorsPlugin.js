
"use strict";

class NoEmitOnErrorsPlugin {
  apply(compiler) {
    // 注入hook - NoEmitOnEoorsPlugin
    compiler.hooks.shouldEmit.tap("NoEmitOnEoorsPlugin", compilation => {
			if (compilation.getStats().hasErrors()) return false;
    });
    compiler.hooks.compilation.tap("NoEmitOnErrorsPlugin", () => {
    	compilation.hooks.shouldRecord.tap("NoEmitOnErrorsPlugin", () => {
				if (compilation.getStats().hasErrors()) return false;
			});
    })
  }
}
module.exports = NoEmitOnErrorsPlugin;