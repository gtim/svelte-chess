// This config excludes stockfish/webworker tests, for use when running test suite in Github actions.
// Those stopped working between 2023-07-24 and 2023-08-13, but work fine locally.
//
// Example failed job: https://github.com/gtim/svelte-chess/actions/runs/5847212483/job/15853245035
// FAIL  test/Chess.engine.test.ts [ test/Chess.engine.test.ts ]
// FAIL  test/engine.test.ts [ test/engine.test.ts ]
//TypeError: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of URL
// ❯ Object.openSync node:fs:595:10
// ❯ readFileSync node:fs:471:35
// ❯ node_modules/vite/dist/node/constants.js:5:32


import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vitest.config.ts'

export default mergeConfig(viteConfig, defineConfig({
	test: {
		exclude: [...configDefaults.exclude, 'test/Chess.engine.test.ts', 'test/engine.test.ts'],
	},
}))
