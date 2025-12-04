import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/analytics.umd.js',
            format: 'umd',
            name: 'AnalyticsSDK',
            sourcemap: true
        },
        {
            file: 'dist/analytics.esm.js',
            format: 'es',
            sourcemap: true
        }
    ],
    plugins: [
        resolve(),
        commonjs(),
        terser()
    ]
};
