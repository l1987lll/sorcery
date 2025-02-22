import { resolve } from 'path';
import Node from './Node.js';
import Chain from './Chain.js';

export { createOverridePathFunction } from './utils/pathOverrides';

export function load(file, options) {
	const { node, sourcesContentByPath, sourceMapByPath } = init(file, options);

	return node.load(sourcesContentByPath, sourceMapByPath, options.ignoreSourceContent)
		.then(() => node.isOriginalSource ? null : new Chain(node, sourcesContentByPath));
}

export function loadSync(file, options = {}) {
	const { node, sourcesContentByPath, sourceMapByPath } = init(file, options);

	node.loadSync(sourcesContentByPath, sourceMapByPath, options.ignoreSourceContent);
	return node.isOriginalSource ? null : new Chain(node, sourcesContentByPath);
}

function init(file, options = {}) {
	const { overrideSourcePathFunc, overrideSourceRootFunc } = options;
	const node = new Node({ file, parent: null, overrideSourcePathFunc, overrideSourceRootFunc });

	let sourcesContentByPath = {};
	let sourceMapByPath = {};

	if (options.content) {
		Object.keys(options.content).forEach(key => {
			sourcesContentByPath[resolve(key)] = options.content[key];
		});
	}

	if (options.sourcemaps) {
		Object.keys(options.sourcemaps).forEach(key => {
			sourceMapByPath[resolve(key)] = options.sourcemaps[key];
		});
	}

	return { node, sourcesContentByPath, sourceMapByPath };
}
