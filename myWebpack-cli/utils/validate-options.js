const webpackConfigurationSchema = require("../config/webpackConfigurationSchema.json");
const validateSchema = require("webpack").validateSchema;
// 验证传入的webpack.config.js
/* 
	options = [
		{
			mode: 'production',
			entry: { main: './src/main.js' },
			output: {
				filename: '[name].js',
				path: 'H:\\不回头\\webpack\\webpack-demo\\dist'
			}
		}
	]
*/
module.exports = function validateOptions(options) {
	let error;
	try {
		const errors = validateSchema(webpackConfigurationSchema, options);
		if (errors && errors.length > 0) {
			const { WebpackOptionsValidationError } = require("webpack");
			error = new WebpackOptionsValidationError(errors);
		}
	} catch (err) {
		error = err;
	}

	if (error) {
		console.error(error.message);
		// eslint-disable-next-line no-process-exit
		process.exit(-1);
	}
};
