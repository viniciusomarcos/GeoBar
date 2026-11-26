import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const result = spawnSync(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'build', '--webpack'],
  {
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4174' }
  }
)

if (result.error) {
  throw result.error
}
process.exitCode = result.status ?? 1
