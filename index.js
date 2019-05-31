const through = require('through2')
const PluginError = require('plugin-error')
const Liquid = require('liquidjs')
const replaceExtension = require('replace-ext')
const objectAssignDeep = require('object-assign-deep')

const PLUGIN_NAME = 'gulp-liquidjs'

module.exports = (opts) => {
	const defaults = {
		engine: {
			extname: '.liquid',
		},
		ext: '.html',
		filters: [],
		tags: [],
		plugins: [],
		data: {},
	}

	const options = objectAssignDeep(defaults, opts)
	const engine = new Liquid(options.engine)

	if (options.filters.length) {
		for (const filter in options.filters) {
			if (Object.prototype.hasOwnProperty.call(options.filters, filter)) {
				engine.registerFilter(filter, options.filters[filter])
			}
		}
	}

	if (options.tags.length) {
		for (const tag in options.tags) {
			if (Object.prototype.hasOwnProperty.call(options.tags, tag)) {
				engine.registerTag(tag, options.tags[tag])
			}
		}
	}

	if (options.plugins.length) {
		for (const plugin of options.plugins) {
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
			const f = file

			f.path = replaceExtension(f.path, options.ext)

			engine.parseAndRender(f.contents.toString(), options.data)
				.then((output) => {
					f.contents = Buffer.from(output)
					callback(null, f)
				}, err => callback(new PluginError(PLUGIN_NAME, err)))
		}

		return callback(null, file)
	})
}
