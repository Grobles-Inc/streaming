/**
 * Regenerates src/routeTree.gen.ts by driving the same generator the vite
 * plugin uses, so the route tree can be refreshed without booting a dev server
 * or a full build.
 *
 * Usage: node scripts/generate-route-tree.mjs
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Generator, getConfig } from '@tanstack/router-generator'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const config = getConfig(
  {
    target: 'react',
    autoCodeSplitting: true,
    routesDirectory: path.join(root, 'src/routes'),
    generatedRouteTree: './src/routeTree.gen.ts',
  },
  root
)

const generator = new Generator({ config, root })
await generator.run()

console.log('routeTree.gen.ts regenerado')