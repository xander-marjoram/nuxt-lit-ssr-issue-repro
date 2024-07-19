import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: './src/index.ts',
    output: {
        dir: './dist',
        format: 'es',
    },
    external: (id) => {
        if (/^lit/.test(id)) {
            console.log('Externalising', id);
            return true;
        }
    },
    plugins: [
        typescript(),
        nodeResolve()
    ],
};
