import {defineConfig} from 'tsdown'
import {load as yamlParse} from 'js-yaml'
import {createFilter, dataToEsm} from '@rollup/pluginutils'

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'node',
  dts: false,
  sourcemap: true,
  outputOptions: {
    // sourcemapExcludeSources: true, // unsupported. maybe some time later
  },
  plugins: [
    pluginYaml(),
    sourcemapExcludeSources(),
  ],
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

export function pluginYaml() {
  const filter = createFilter(['**/*.yaml', '**/*.yml'])

  return {
    name: 'yaml',
    transform(code: any, id: string) {
      if (!filter(id)) {
        return null
      }

      const jsonObject = yamlParse(code)

      const esModuleString = dataToEsm(jsonObject, {
        preferConst: true,
      })

      return {
        code: esModuleString,
        map: {mappings: ''},
      }

    },
  }
}