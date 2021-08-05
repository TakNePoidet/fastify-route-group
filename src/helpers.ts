export function normalizeNamespaces(path: string): string {
	if (!['string', 'number'].includes(typeof path)) {
		return '/';
	}
	let normalPath = path.toString().charAt(0) !== '/' ? `/${path}` : path;

	normalPath = normalPath.replace(/\/{2,}/, '/');

	if (normalPath.length > 1 && /\/$/.exec(normalPath)) {
		normalPath = normalPath.replace(/\/$/, '');
	}

	return normalPath;
}
