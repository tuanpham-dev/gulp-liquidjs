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
		filters: {},
		tags: {},
		plugins: [],
		data: {},
	}

	const options = objectAssignDeep(defaults, opts)
	const engine = new Liquid(options.engine)

	for (const filter in options.filters) {
		if (Object.prototype.hasOwnProperty.call(options.filters, filter)) {
			engine.registerFilter(filter, options.filters[filter])
		}
	}

	for (const tag in options.tags) {
		if (Object.prototype.hasOwnProperty.call(options.tags, tag)) {
			engine.registerTag(tag, options.tags[tag])
		}
	}

	if (options.plugins.length) {
		for (const plugin of options.plugins) {
			engine.plugin(plugin)
		}
	}

	return through.obj((file, encoding, callback) => {
		const f = file

		if (f.data) {
			objectAssignDeep(options.data, f.data)
		}

		if (f.isNull()) {
			return callback(null, f)
		}

		if (f.isStream()) {
			return callback(new PluginError(PLUGIN_NAME, 'Streaming is not supported'))
		}

		if (f.isBuffer()) {
			f.path = replaceExtension(f.path, options.ext)

			engine.parseAndRender(f.contents.toString(), options.data)
				.then((output) => {
					f.contents = Buffer.from(output)
					return callback(null, f)
				}, err => callback(new PluginError(PLUGIN_NAME, err)))
		}

		return null
	})
}
