import babel from 'rollup-plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  external: ['react'], 
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup', 'react-plus']
    })
  ]
};
