import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  external: [ 'react' ], 
  plugins: [
    postcss({modules: true}), 
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ]
};
