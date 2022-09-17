  Sorcery version <%= version %>
  =====================================

  Usage:
    sorcery [options]

  Options:
    -h, --help                    Show help message
    -v, --version                 Show version
    -i, --input <file|folder>     Input file
    -o, --output <file|folder>    Output file (if absent, will overwrite input)
    -d, --datauri                 Append map as a data URI, rather than separate file
    -x, --excludeContent          Don't populate the sourcesContent array
    -osp, --overrideSourcePath    Override path of source in sourcemap file
    -orp, --overrideSourceRoot    Override path of sourceRoot in sourcemap file
    -isc, --ignoreSourceContent   Ignore the sourcesContent property in source map file


  Example:

    sorcery --input some/generated/code.min.js
    sorcery --input tmp --output dist


  For more information visit https://github.com/l1987lll/sorcery
