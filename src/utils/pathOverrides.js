
export function createOverridePathFunction(pathOverrides) {
    const overridePatterns = parsePathOverrides(pathOverrides);
    return function (filePath, originalPath) {
        const pattern = overridePatterns.find(function (p) {
            return new RegExp(p.file.replace(/\//g, '\\\\')).test(filePath) && new RegExp(p.origin).test(originalPath);
        });

        if (pattern) {
            return pattern.origin === '' ? pattern.replacement : originalPath.replace(new RegExp(pattern.origin), pattern.replacement);
        }

        return originalPath;
    }
}

function parsePathOverrides(pathOverrides) {
    let patterns = [];
    if (typeof pathOverrides == 'string') {

        if (pathOverrides.startsWith('[') && pathOverrides.endsWith(']')) {
            try {
                patterns = JSON.parse(pathOverrides);
            } catch (error) {
                throw 'path overrides are not valid json format';
            }
        } else {
            patterns = pathOverrides.split(' , ');
        }

    } else if (Array.isArray(pathOverrides)) {
        patterns = pathOverrides;
    } else {
        throw 'path overrides are not valid format';
    }

    return patterns.map(function (pattern) { return new PathOverridePattern(pattern) });
}

function PathOverridePattern(patternsString) {
    if (typeof patternsString !== 'string') {
        throw new Error('path patterns are not valid format');
    }

    let patterns = patternsString.split(' | ');
    if (patterns.length > 3) {
        throw new Error('path patterns are not valid format');
    } else if (patterns.length === 2) {
        patterns = [''].concat(patterns);
    } else if (patterns.length === 1) {
        patterns = ['', ''].concat(patterns);
    }

    this.file = patterns[0];
    this.origin = patterns[1];
    this.replacement = patterns[2];
}