import swc from 'unplugin-swc'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		// nest's swc builder ignores tsconfig.build excludes and emits specs into dist
		exclude: [...configDefaults.exclude, 'dist/**'],
		alias: {
			src: './src',
			test: './test',
		},
		root: './',
	},
	resolve: {
		alias: {
			src: './src',
			test: './test',
		},
	},
	plugins: [swc.vite()],
})
