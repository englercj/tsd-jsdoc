import { JsdocCommand, JsdocOptions } from './jsdoc-api';
import { spawnSync } from 'child_process';

const toSpawnArgs = require('object-to-spawn-args') as
    (object: object, options?: { quote?: boolean; optionEqualsValue?: boolean }) => string[];

class RenderSync extends JsdocCommand {
    getOutput (err?: Error) {
        if (err) throw err;

        const jsdocArgs = toSpawnArgs(this.jsdocOptions)
            .concat(this.options.source ? this.tempFile!.path : this.options.files!);

        jsdocArgs.unshift(this.jsdocPath);

        spawnSync('node', jsdocArgs, {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit',
            encoding: 'utf-8'
        });
    }
}

export function renderSync(options: JsdocOptions) {
    const command = new RenderSync(options);
    return command.execute();
}
