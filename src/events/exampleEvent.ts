import { Interpreter } from '@tryforge/forgescript'
import { MyExtension } from '..'
import { MyExtensionEventHandler } from '../structures/eventManager'

// ─── exampleEvent handler ─────────────────────────────────────────────────────
// One file per event. The file name doesn't matter

export default new MyExtensionEventHandler({
    name: 'exampleEvent',
    version: '1.0.0',
    description: 'Fired when an example event occurs.',

    listener(extras) {
        // Retrieve all commands registered for this event type.
        const commands = this.getExtension(MyExtension, true)
            .commands
            .get('exampleEvent')

        for (const command of commands) {
            Interpreter.run({
                client: this,
                command,
                data: command.compiled.code,
                obj: {},        // The discord.js object for this event, if any.
                extras,         // Passed as ctx.extras inside $functions.
            })
        }
    },
})
