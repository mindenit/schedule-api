import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const installCmd = new Map([
	['npm', 'npm i'],
	['yarn', 'yarn'],
	['pnpm', 'pnpm i'],
])

const lockFiles = new Map([
	['npm', 'package-lock.json'],
	['yarn', 'yarn.lock'],
	['pnpm', 'pnpm-lock.yaml'],
])

const isLockfileExist = (pm) => {
	return existsSync(resolve(dirname('../'), `./${lockFiles.get(pm)}`))
}

const identifyPackageManager = () => {
	if (isLockfileExist('npm')) {
		return 'npm'
	} else if (isLockfileExist('yarn')) {
		return 'yarn'
	} else if (isLockfileExist('pnpm')) {
		return 'pnpm'
	} else {
		console.error('No lockfile found')
		process.exit(1)
	}
}

const packageManager = identifyPackageManager()

await mkdir(resolve(dirname('../'), './node_modules/.cache')).catch(() => {})

const cachePath = resolve(
	dirname('../'),
	'./node_modules/.cache/deps_check_lock_hash.txt',
)

const lockFilePath = resolve(dirname('../'), lockFiles.get(packageManager))

const lockHashCache = await readFile(cachePath, {
	encoding: 'utf-8',
	flag: 'a+',
}).catch(() => {})

const lockHash = createHash('sha256')
	.update(await readFile(lockFilePath, { encoding: 'utf-8' }))
	.digest('hex')

if (lockHashCache !== lockHash) {
	execSync(installCmd.get(packageManager), { stdio: 'inherit' })
	await writeFile(cachePath, lockHash)
}
