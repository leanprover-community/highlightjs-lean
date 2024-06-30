# highlightjs-lean

A [highlightjs](https://highlightjs.org/) language grammar for the
[Lean](https://leanprover.github.io) theorem proving language.

## Usage

(Usage instructions adapted from the [highlightjs-robots-txt README.md](https://github.com/highlightjs/highlightjs-robots-txt/blob/master/README.md).)

Simply include the Highlight.js library in your webpage or Node app, then load this module.

This adds a `sorry` style on top of the standard highlightjs styles for highlighting `sorry` and `admit`.
You can set the color of this by adding the following CSS style:
```html
<style>
.hljs-sorry {
  color: red;
}
</style>
```

### Static website or simple usage

Simply load the module after loading Highlight.js. You'll use the minified version found in the `dist` directory. This module is just a CDN build of the language, so it will register itself as the Javascript is loaded.

```html
<script type="text/javascript" src="/path/to/highlight.min.js"></script>
<script type="text/javascript" charset="UTF-8"
  src="/path/to/highlightjs-lean/dist/lean.min.js"></script>
<script type="text/javascript">
  hljs.highlightAll();
</script>
```

### Using directly from the UNPKG CDN

```html
<script type="text/javascript"
  src="https://unpkg.com/highlightjs-lean/dist/lean.min.js"></script>
```

- More info: <https://unpkg.com>

- For a minimal HTML page which uses this package from the UNPKG CDN, see `test/cdn_test.html` ([contributed by Ed Ayers](https://github.com/leanprover-community/highlightjs-lean/issues/13)).

**Important note**: If you have pinned a CDN version of `highlightjs-lean` older than 1.2.0 in your web page, please update as those builds are broken and cannot be fixed. See [the explanation in issue #13](https://github.com/leanprover-community/highlightjs-lean/issues/13#issuecomment-2198344147).

### With Node or another build system

If you're using Node / Webpack / Rollup / Browserify, etc, simply require the language module, then register it with Highlight.js.

```javascript
var hljs = require('highlightjs');
var leanHljs = require('highlightjs-lean');

hljs.registerLanguage("lean", leanHljs);
hljs.highlightAll();
```

## Contributing

(Instructions adapted from the [highlightjs-cypher CONTRIBUTING.md](https://github.com/highlightjs/highlightjs-cypher/blob/master/CONTRIBUTING.md).)

To build `dist/lean.min.js` this repository should be cloned to the `extra/`
subdirectory of the [highlight.js repo](https://github.com/highlightjs/highlight.js).

```bash
git clone https://github.com/highlightjs/highlight.js
cd highlight.js
```

Install the dependencies:

```bash
npm i
```

Clone this repository into the `extra/` directory:

```bash
cd extra
git clone https://github.com/leanprover-community/highlightjs-lean
cd highlightjs-lean/
npm i
```

You can run the `highlightjs-lean` tests with `npm test`.

When you're done editing the files in `highlightjs-lean` and want to build
`dist/lean.min.js`, navigate to the root of the `highlight.js` directory and
run:

```bash
node  --stack-size=65500  ./tools/build.js -t cdn
```

## License

`highlightjs-lean` is released under the BSD-3-Clause license.
See [LICENSE](./LICENSE) for more details.

### Author

Patrick Massot
