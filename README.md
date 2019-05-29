# gulp-liquidjs
A shopify compatible Liquid template engine for Gulp using [liquidjs][harttle/liquidjs].

## Installation

```bash
npm install --save-dev gulp-liquidjs
```

## Usage
```javascript
const gulp = require('gulp')
const liquid = require('gulp-liquidjs')

gulp.task('liquid', () => {
    return gulp.src('./src/*.liquid')
        .pipe(liquid())
        .pipe(gulp.dest('./dist'))
})
```

## Options
All options are optional.

### `engine`
Engine options.

```javascript
.pipe(liquid({
    engine: {
        root: ['./src/liquid/templates', './src/liquid/snippets'],
        extname: '.liquid'
    }
}))
```

* `root` is a directory or an array of directories to resolve layouts and includes, as well as the filename passed in when calling `.renderFile()`.
If an array, the files are looked up in the order they occur in the array.
Defaults to `["."]`

* `extname` is used to lookup the template file when filepath doesn't include an extension name. Eg: setting to `".html"` will allow including file by basename. Defaults to `".liquid"`.

* `cache` indicates whether or not to cache resolved templates. Defaults to `false`.

* `dynamicPartials`: if set, treat `<filepath>` parameter in `{%include filepath %}`, `{%layout filepath%}` as a variable, otherwise as a literal value. Defaults to `true`.

* `strictFilters` is used to enable strict filter existence. If set to `false`, undefined filters will be rendered as empty string. Otherwise, undefined filters will cause an exception. Defaults to `false`.

* `strictVariables` is used to enable strict variable derivation. 
If set to `false`, undefined variables will be rendered as empty string.
Otherwise, undefined variables will cause an exception. Defaults to `false`.

* `trimTagRight` is used to strip blank characters (including ` `, `\t`, and `\r`) from the right of tags (`{% %}`) until `\n` (inclusive). Defaults to `false`.

* `trimTagLeft` is similiar to `trimTagRight`, whereas the `\n` is exclusive. Defaults to `false`. See [Whitespace Control][whitespace control] for details.

* `trimOutputRight` is used to strip blank characters (including ` `, `\t`, and `\r`) from the right of values (`{{ }}`) until `\n` (inclusive). Defaults to `false`.

* `trimOutputLeft` is similiar to `trimOutputRight`, whereas the `\n` is exclusive. Defaults to `false`. See [Whitespace Control][whitespace control] for details.

* `tagDelimiterLeft` and `tagDelimiterRight` are used to override the delimiter for liquid tags.

* `outputDelimiterLeft` and `outputDelimiterRight` are used to override the delimiter for liquid outputs.

* `greedy` is used to specify whether `trim*Left`/`trim*Right` is greedy. When set to `true`, all consecutive blank characters including `\n` will be trimed regardless of line breaks. Defaults to `true`.


### `ext`
Extension name of destination filename. Defaults to `.html`.

```javascript
.pipe(liquid({
    ext: '.html'
}))
```

### `filters`
Array of filter object to register custom filters: `{<filter_name>: <filter_function>}`.

```javascript
.pipe(liquid({
    filters: [
        // Usage: {{ name | upper }}
        {upper: v => v.toUpperCase()},
        // Usage: {{ 1 | add: 2, 3 }}
        {add: (initial, arg1, arg2) => initial + arg1 + arg2}
    ]
}))
```

See existing filter implementations here: <https://github.com/harttle/liquidjs/tree/master/src/builtin/filters>

### `tags`
Array of tag object to register custom tags: `{<tag_name> : {parse: <parse_function>, render: <render_function>}}`

```javascript
.pipe(liquid({
    tags: [
        // Usage: {% upper name %}
        {upper: {
            parse: (tagToken, remainTokens) => {
                this.str = tagToken.args // name
            },
            render: async (scope, hash) {
                var str = await liquid.evalValue(this.str, scope) // 'alice'
                return str.toUpperCase() // 'ALICE
            }
        }}
    ]
}))
```

### `plugins`
A pack of tags or filters can be encapsulated into a plugin, which will be typically installed via npm.

```javascript
const somePlugin = require('./some-plugin')

gulp.task('liquid', () => {
    return gulp.src('./src/*.liquid')
        .pipe(liquid({
            plugins: [somePlugin]
        }))
        .pipe(gulp.dest('./dist'))
})

// some-plugin.js
module.exports = (Liquid) => {
    // here `this` refers to the engine instance
    // `Liquid` provides facilities to implement tags and filters
    this.registerFilter('foo', x => x);
}
```
