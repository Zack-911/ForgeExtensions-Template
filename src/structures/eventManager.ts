import { BaseEventHandler, ForgeClient } from '@tryforge/forgescript'
import { MyExtension } from '..'

// ─── Event signatures ─────────────────────────────────────────────────────────
// Each key is an event name. The value is a tuple of the arguments that event passes to its listener

export interface IMyExtensionEvents {
    /**
     * Fired when the extension is ready.
     * Tuple is empty — no arguments passed to listeners.
     */
    ready: []

    /**
     * Example event that passes some data to listeners.
     * Replace with your own event names and argument shapes.
     */
    exampleEvent: [
        {
            userId: string
            data: unknown
        }
    ]
}

export class MyExtensionEventHandler<T extends keyof IMyExtensionEvents>
    extends BaseEventHandler<IMyExtensionEvents, T> {
    register(client: ForgeClient): void {
        client
            .getExtension(MyExtension, true)
            .emitter
            .on(this.name, this.listener.bind(client) as any)
    }
}
