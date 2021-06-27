import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const plugins = [
	typescript({
		tsconfig: './tsconfig.json',
		exclude: ['test/**', 'example/**']
	})
];

if (isDev === false) {
	plugins.push(terser());
}
export default {
	input: './src/index.ts',
	output: [
		{
			file: './dist/index.js',
			format: 'cjs'
		}
	],
	plugins
};
