import {defineConfig, UserConfig} from 'vite'
import viteYaml from '@modyfi/vite-plugin-yaml'
import * as fs from 'node:fs/promises'
import {resolve} from 'node:path'


export default defineConfig(async () => {
  const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'))

  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    /^node:/,
  ]

  return <UserConfig>{
    build: {
      minify: true,
      sourcemap: true,
      lib: {
        entry: {
          index: './src/index.ts',
        },
        formats: ['es'],
        name: 'index',
      },
      target: 'esnext',
      rolldownOptions: {
        external: id => externals.some(ext => ext instanceof RegExp ? ext.test(id) : id.startsWith(ext)),
      },
    },
    resolve: {
      alias: {
        '@': resolve('./src'),
      },
    },
    plugins: [
      viteYaml(),
      sourcemapExcludeSources(),
    ],
  }
})

/**
 * @see https://github.com/rolldown/rolldown/issues/5554
 */
export function sourcemapExcludeSources() {
  return {
    name: 'sourcemap-exclude-sources',
    async generateBundle(options: any, bundle: Record<any, any>) {
      for (const name in bundle) {

        //only modify .map files
        if (!name.endsWith('.map')) {
          continue
        }
        const chunk = bundle[name]

        //only modify newly generated assets
        if (chunk.type !== 'asset' || chunk.originalFileNames.length) {
          continue
        }

        const map = JSON.parse(chunk.source)

        if (!map.sourcesContent.length) {
          continue
        }

        map.sourcesContent.fill(null)
        chunk.source = JSON.stringify(map)
      }
    },
  }
}