import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  // 主库构建（浏览器端）
  {
    input: 'index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'VersionCheck',
      },
    ],
    plugins: [
      typescript(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          ecma: 2020,
          module: true,
          comparisons: true,
          conditionals: true,
          booleans: true,
          loops: true,
          unused: true,
          toplevel: true,
          unsafe_proto: true,
          passes: 3,
        },
        mangle: {
          properties: {
            regex: /^_[^_]/,
          },
        },
        output: {
          comments: false,
          ascii_only: true,
        },
      }),
    ],
  },
  // 插件构建（Node.js 端）
  {
    input: 'plugin.ts',
    output: [
      {
        file: 'dist/plugin.js',
        format: 'esm',
      },
      {
        file: 'dist/plugin.cjs',
        format: 'cjs',
      },
    ],
    external: ['fs', 'path', 'child_process'],
    plugins: [
      typescript(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      terser({
        compress: {
          // drop_console: true,
          drop_debugger: true,
          ecma: 2020,
          module: true,
          comparisons: true,
          conditionals: true,
          booleans: true,
          loops: true,
          unused: true,
          toplevel: true,
          unsafe_proto: true,
          passes: 3,
        },
        mangle: {
          properties: {
            regex: /^_[^_]/,
          },
        },
        output: {
          comments: false,
          ascii_only: true,
        },
      }),
    ],
  },
];
