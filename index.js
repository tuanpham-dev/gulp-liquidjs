const through = require('through2')
const PluginError = require('plugin-error')
const Liquid = require('liquidjs')
const replaceExtension = require('replace-ext')
const objectAssignDeep = require('object-assign-deep')

const PLUGIN_NAME = 'gulp-liquidjs'

module.exports = (opts) => {
	const defaults = {
		engine: {
			extname: '.liquid'
		},
		ext: '.html',
		filters: [],
		tags: [],
		plugins: [],
		data: {}
	}

	opts = objectAssignDeep(defaults, opts)
	const engine = new Liquid(opts.engine)

	if (opts.filters.length) {
		for (filter in opts.filters) {
			if (opts.filters.hasOwnProperty(filter)) {
				engine.registerFilter(filter, opts.filters[filter])
			}
		}
	}

	if (opts.tags.length) {
		for (tag in opts.tags) {
			if (opts.tags.hasOwnProperty(tag)) {
				engine.registerTag(tag, opts.tags[tag])
			}
		}
	}

	if (opts.plugins.length) {
		for (plugin of opts.plugins) {
			engine.plugin(plugin)
		}
	}

	return through.obj((file, encoding, callback) => {
		if (file.isNull()) {
			return callback(null, file)
		}

		if (file.isStream()) {
			return callback(new PluginError(PLUGIN_NAME, 'Streaming is not supported'))
		}

		if (file.isBuffer()) {
			file.path = replaceExtension(file.path, opts.ext)

			engine.parseAndRender(file.contents.toString(), opts.data)
				.then((output) => {
					file.contents = Buffer.from(output);
					callback(null, file);
				}, (err) => {
					new PluginError(PLUGIN_NAME, 'Error during compiling')
				})
		}
	})
}
