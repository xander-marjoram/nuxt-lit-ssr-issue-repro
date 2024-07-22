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
            console.log(`Excluding ${id} from the bundle`);
            return true;
        }

        return false;
    },
    plugins: [
        typescript(),
        nodeResolve()
    ],
};
