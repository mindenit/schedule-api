import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed'
import pluginJs from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import pluginOxfmt from 'eslint-plugin-oxfmt'
import pluginSecurity from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
	{ ignores: ['coverage', 'public', 'dist', 'pnpm-lock.yaml', 'legacy'] },
	pluginJs.configs.recommended,
	pluginSecurity.configs.recommended,
	eslintNestJs.configs.flatRecommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			globals: { ...globals.node },
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mjs', 'commitlint.config.mjs'],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		rules: {
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'unused-imports/no-unused-imports': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@darraghor/nestjs-typed/api-method-should-specify-api-response': 'off',
		},
	},
	{ files: ['**/*.spec.ts', '**/*.e2e.ts'], ...vitest.configs.recommended },
	pluginOxfmt.configs.recommendedWithoutParser,
)
