Forked from [Sorcery](https://github.com/Rich-Harris/sorcery) and made some changes:
1. Update sourcemap-codec to use the exact version 1.3.0, install larger version lead to build failed.
2. Replace \n with \r\n in test expected and actual files to fix test failures, some platform use \r\n to start a new line.
3. Use Buffer.from instead of Buffer to fix warning of deprecated Buffer.
4. Modify regex of matching SOURCEMAPPING_URL, the old regex might replace more content when existing multiple SOURCEMAPPING_URL at the end of the file.
5. Add parent property to Node type, if the Node.file is null, it will use parent.file to resolve sourceRoot path.
6. Give type to parameters of sorcery CLI.
7. Add Feature: support overriding the path of sources and sourceRoot in sourcemap file. 
8. Add Feature: support ignoring the sourcesContent property in source map file, and sorcery will read content from files specified in sources property.

Usage as below:

```
New Options:
  --osp <string>,        Override path of source in sourcemap file.    
  --orp <string>,        Override path of sourceRoot in sourcemap file.
  --isc <boolean>,       Ignore the sourcesContent property in source map file.

parameter pattern:
  jsFileRegex1 | matchRegex1 | replacement1 , jsFileRegex2 | matchRegex2 | replacement2 ...

  jsFileRegex:  A regexp to match the js file which the sourcemap related to. [optional] 
  matchRegex :  A regexp to match the original path in the source property of sourcemap. [optional]
  replacement:  A string that will be used to replace.
```
Examples:

```bash
# helloWorld.js import util.js, after build helloWorld.min.js is placed in dist folder 
# but util.min.js in current folder
sorcery -i "dist/helloWorld.min.js" -osp "helloWorld.min.js | ./util.min.js | ../util.min.js"

sorcery -i "dist/helloWorld.min.js" -osp "helloWorld.min.js | ./a.js | ../a.js , helloWorld.min.js | ./b.js | ../b.js"

sorcery -i "dist/helloWorld.min.js" -osp "./util.min.js | ../util.min.js"

sorcery -i "dist/helloWorld.min.js" -orp "helloWorld.min.js |  | ../"

sorcery -i "dist/helloWorld.min.js" -orp "../"

```

You can also implement your own replace logic and pass the function as options into ***sorcery.load*** or import ***createOverridePathFunction*** to use the logic same as CLI.

```js

const sorcery = require('sorcery');
const sourcePathOverrides = [
  "helloWorld.min.js | ./a.js | ../a.js",
  "helloWorld.min.js | ./b.js | ../b.js"
  ];
const sourceRootOverrides ="Webpack:/// | ./";
const options = {
		overrideSourcePathFunc: sorcery.createOverridePathFunction(sourcePathOverrides),
		overrideSourceRootFunc: sorcery.createOverridePathFunction(sourceRootOverrides)
	};

sorcery.load('helloWorld.min.js', options).then(function (chain) {
  chain.write('./', {
          inline: false,
          includeContent: true
        });
});

```

Tips:
1. you can use `yarn link` command in workspace folder to add a symlink to sorcery then use `yarn link sorcery` command in other project to use sorcery.
2. you can execute below command in VSCode Javascript Debug Terminal to debug sorcery:

   ```bash
    node sorcery -x -i "F:\Sources\a\dist\vendor.js" -o "" --osp "" --orp "dist/[^.]+.js$ | .+ | ../"
   ```


-----------------------------------------------------------------
# sorcery.js

Sourcemaps are great - if you have a JavaScript file, and you minify it, your minifier can generate a map that lets you debug as though you were looking at the original uncompressed code.

But if you have more than one transformation - say you want to transpile your JavaScript, concatenate several files into one, and minify the result - it gets a little trickier. Each intermediate step needs to be able to both *ingest* a sourcemap and *generate* one, all the time pointing back to the original source.

Most compilers don't do that. ([UglifyJS](https://github.com/mishoo/UglifyJS2) is an honourable exception.) So when you fire up devtools, instead of looking at the original source you find yourself looking at the final intermediate step in the chain of transformations.

**Sorcery aims to fix that.** Given an file at the end of a transformation chain (e.g., your minified JavaScript), it will follow the entire chain back to the original source, and generate a new sourcemap that describes the whole process. How? Magic.

This is a work-in-progress - suitable for playing around with, but don't rely on it to debug air traffic control software or medical equipment. Other than that, it can't do much harm.


## Usage

### As a node module

Install sorcery locally:

```bash
npm install sorcery
```

```js
var sorcery = require( 'sorcery' );

sorcery.load( 'some/generated/code.min.js' ).then( function ( chain ) {
  // generate a flattened sourcemap
  var map = chain.apply(); // { version: 3, file: 'code.min.js', ... }

  // get a JSON representation of the sourcemap
  map.toString(); // '{"version":3,"file":"code.min.js",...}'

  // get a data URI representation
  map.toUrl(); // 'data:application/json;charset=utf-8;base64,eyJ2ZXJ...'

  // write to a new file - this will create `output.js` and
  // `output.js.map`, and will preserve relative paths. It
  // returns a Promise
  chain.write( 'output.js' );

  // write to a new file but use an absolute path for the
  // sourceMappingURL
  chain.write( 'output.js', { absolutePath: true });

  // write to a new file, but append the flattened sourcemap as a data URI
  chain.write( 'output.js', { inline: true });

  // overwrite the existing file
  chain.write();
  chain.write({ inline: true });

  // find the origin of line x, column y. Returns an object with
  // `source`, `line`, `column` and (if applicable) `name` properties.
  // Note - for consistency with other tools, line numbers are always
  // one-based, column numbers are always zero-based. It's daft, I know.
  var loc = chain.trace( x, y );
});

// You can also use sorcery synchronously:
var chain = sorcery.loadSync( 'some/generated/code.min.js' );
var map = chain.apply();
var loc = chain.trace( x, y );
chain.writeSync();
```

#### Advanced options

You can pass an optional second argument to `sorcery.load()` and `sorcery.loadSync()`, with zero or more of the following properties:

* `content` - a map of `filename: contents` pairs. `filename` will be resolved against the current working directory if needs be
* `sourcemaps` - a map of `filename: sourcemap` pairs, where `filename` is the name of the file the sourcemap is related to. This will override any `sourceMappingURL` comments in the file itself.

For example:

```js
sorcery.load( 'some/generated/code.min.js', {
  content: {
    'some/minified/code.min.js': '...',
    'some/transpiled/code.js': '...',
    'some/original/code.js': '...'
  },
  sourcemaps: {
    'some/minified/code.min.js': {...},
    'some/transpiled/code.js': {...}
  }
}).then( chain => {
  /* ... */
});
```

Any files not found will be read from the filesystem as normal.

### On the command line

First, install sorcery globally:

```bash
npm install -g sorcery
```

```
Usage:
  sorcery [options]

Options:
  -h, --help               Show help message
  -v, --version            Show version
  -i, --input <file>       Input file
  -o, --output <file>      Output file (if absent, will overwrite input)
  -d, --datauri            Append map as a data URI, rather than separate file
  -x, --excludeContent     Don't populate the sourcesContent array
```

Examples:

```bash
# overwrite sourcemap in place (will write map to
# some/generated/code.min.js.map, and update
# sourceMappingURL comment if necessary
sorcery -i some/generated/code.min.js

# append flattened sourcemap as an inline data URI
# (will delete existing .map file, if applicable)
sorcery -d -i some/generated/code.min.js

# write to a new file (will create newfile.js and
# newfile.js.map)
sorcery -i some/generated/code.min.js -o newfile.js
```


## License

MIT
