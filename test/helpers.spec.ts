import { normalizeNamespaces } from '../src/helpers';

test('Normalizing the namespace', () => {
	expect(normalizeNamespaces('posts')).toBe('/posts');
	expect(normalizeNamespaces('/posts')).toBe('/posts');
	expect(normalizeNamespaces('///posts')).toBe('/posts');
	expect(normalizeNamespaces('posts//')).toBe('/posts');
	expect(
		normalizeNamespaces(
			// @ts-ignore
			1
		)
	).toBe('/1');
	expect(
		normalizeNamespaces(
			// @ts-ignore
			false
		)
	).toBe('/');
});
