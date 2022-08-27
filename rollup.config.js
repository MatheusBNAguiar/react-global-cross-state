import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const entrypoint = 'src/index.ts'

export default [
  {
    input: entrypoint,
    plugins: [esbuild()],
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
  },
  {
    input: entrypoint,
    plugins: [dts()],
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
      },
    ],
  },
]
