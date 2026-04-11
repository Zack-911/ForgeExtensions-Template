import { ForgeClient, ForgeExtension, EventManager } from '@tryforge/forgescript'
import { TypedEmitter } from 'tiny-typed-emitter'
import path from 'path'
import { MyExtensionCommandManager } from './structures/commandManager'
import { IMyExtensionEvents } from './structures/eventManager'

// ─── Options ─────────────────────────────────────────────────────────────────

export interface MyExtensionOptions {
    /**
     * Events to load from the events folder.
     * Only listed events will be registered on the client.
     */
    events?: Array<keyof IMyExtensionEvents>

    // Add your own config options here.
    // Example:
    // apiKey?: string
    // baseUrl?: string
}

// ─── Utility type used by TypedEmitter ───────────────────────────────────────

export type TransformEvents<T> = {
    [P in keyof T]: T[P] extends unknown[] ? (...args: T[P]) => void : never
}

// ─── Extension class ─────────────────────────────────────────────────────────

export class MyExtension extends ForgeExtension {
    /** The extension name. Must be unique across all loaded extensions. */
    name = 'MyExtension'
    description = 'A ForgeScript extension template.'
    version = require('../package.json').version as string

    public client!: ForgeClient
    public commands!: MyExtensionCommandManager
    public readonly emitter = new TypedEmitter<TransformEvents<IMyExtensionEvents>>()

    constructor(private readonly options: MyExtensionOptions = {}) {
        super()
    }

    /**
     * Called by ForgeScript after version/dependency checks pass.
     * Do all setup here
     */
    init(client: ForgeClient): void {
        this.client = client
        this.commands = new MyExtensionCommandManager(client)
        EventManager.load('MyExtension', path.join(__dirname, './events'))

        // Load only the events the user opted into.
        if (this.options.events?.length) {
            this.client.events.load('MyExtension', this.options.events)
        }

        // Register all functions added by your extension
        this.load(path.join(__dirname, './functions'))

        // Any other setup — API clients, timers, etc. — goes here.
    }
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

export type { IMyExtensionEvents } from './structures/eventManager'
export { MyExtensionCommandManager } from './structures/commandManager'
