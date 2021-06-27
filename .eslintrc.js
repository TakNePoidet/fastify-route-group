module.exports = {
	extends: ['@taknepoidet-config/eslint-config'],
	rules: {
		'import/no-dynamic-require': 0,
		'@typescript-eslint/no-var-requires': 0,
		'import/no-extraneous-dependencies': 0
	},
	overrides: [
		{
			files: ['*.spec.ts'],
			plugins: ['jest'],
			rules: {
				'jest/no-disabled-tests': 'warn',
				'jest/no-focused-tests': 'error',
				'jest/no-identical-title': 'error',
				'jest/prefer-to-have-length': 'warn',
				'jest/valid-expect': 'error'
			},
			env: {
				'jest/globals': true
			}
		}
	]
};
