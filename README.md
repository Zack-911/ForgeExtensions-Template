# forge.extension — ForgeScript Extension Template

A batteries-included starting point for building a ForgeScript extension.

## Structure

```
src/
├── index.ts                        # Extension class (ForgeExtension subclass)
├── structures/
│   ├── commandManager.ts           # Command manager for custom command types
│   ├── eventManager.ts             # Event signatures + base event handler
│   └── index.ts                    # Barrel export
├── events/
│   └── exampleEvent.ts             # One file per event
├── functions/
│   └── example/
│       ├── exampleFunction.ts      # unwrap: true  — simple arg resolution
│       └── exampleAdvanced.ts      # unwrap: false — manual resolution / child code
└── __tests__/
    └── index.ts                    # Dev entry point (excluded from build)
```

## Concepts

### The extension class (`src/index.ts`)

Extend `ForgeExtension` and implement `init(client)`. Everything happens there — never in the constructor, because the ForgeClient isn't ready yet.

```ts
export class MyExtension extends ForgeExtension {
    name = 'MyExtension'   // Must be unique across all loaded extensions
    description = '...'
    version = '1.0.0'

    init(client: ForgeClient): void {
        this.load(path.join(__dirname, './functions'))   // registers $functions
        EventManager.load('MyExtension', path.join(__dirname, './events'))
        // ... anything else
    }
}
```

### Writing `$functions` (`src/functions/`)

Every file exports a `new NativeFunction({ ... })` as its default export. ForgeScript discovers them automatically via `this.load(path)`.

**`unwrap: true`** — simplest form. All args are resolved and typed before `execute`.

```ts
new NativeFunction({
    name: '$greet',
    unwrap: true,
    brackets: true,
    args: [
        { name: 'user', type: ArgType.User, required: true, rest: false },
    ],
    async execute(ctx, [user]) {
        return this.success(`Hello, ${user.username}!`)
    },
})
```

**`unwrap: false`** — manual form. Resolve args yourself for conditional logic or child code blocks.

```ts
new NativeFunction({
    name: '$ifThen',
    unwrap: false,
    brackets: true,
    args: [
        { name: 'condition', type: ArgType.String, condition: true, required: true, rest: false },
        { name: 'code', type: ArgType.Unknown, required: false, rest: true },
    ],
    async execute(ctx) {
        const cond = await this['resolveUnhandledArg'](ctx, 0)
        if (!this['isValidReturnType'](cond)) return cond
        if (cond.value !== 'true') return this.success()

        for (let i = 1; i < this.data.fields!.length; i++) {
            const r = await this['resolveCode'](ctx, this.data.fields![i])
            if (!this['isValidReturnType'](r)) return r
        }
        return this.success()
    },
})
```

**Return helpers:**

| Method | Meaning |
|---|---|
| `this.success(value?)` | Execution OK. Optional string return value. |
| `this.successJSON(value)` | OK. Value is JSON-serialized before returning. |
| `this.customError(msg)` | Runtime error with a custom message. |
| `this.stop()` | Silently halt execution. No error shown. |

**`brackets` values:**

| Value | Meaning |
|---|---|
| `true` | Brackets are **required** — `$fn[...]` |
| `false` | Brackets are **optional** — `$fn` or `$fn[...]` |
| `undefined` | No brackets at all — `$fn` only |

**Accessing extension state inside a function:**

```ts
const ext = ctx.client.getExtension(MyExtension, true)
// ext is typed as MyExtension, throws if not found
```

### Events (`src/events/` + `src/structures/eventManager.ts`)

1. Add your event signature to `IMyExtensionEvents`:

```ts
export interface IMyExtensionEvents {
    ready: []
    thingHappened: [{ userId: string; data: unknown }]
}
```

2. Create an event file under `src/events/`:

```ts
export default new MyExtensionEventHandler({
    name: 'thingHappened',
    listener(extras) {
        const commands = this.getExtension(MyExtension, true).commands.get('thingHappened')
        for (const command of commands) {
            Interpreter.run({ client: this, command, data: command.compiled.code, obj: {}, extras })
        }
    },
})
```

3. Emit the event from your extension code:

```ts
this.emitter.emit('thingHappened', { userId: '123', data: someData })
```

4. Users register commands for it:

```ts
client.commands.add({
    type: 'thingHappened',
    code: 'Something happened for $env[thingHappened;userId]!'
})
```

### Custom command types (`src/structures/commandManager.ts`)

`MyExtensionCommandManager` lets users register commands keyed to your event names. `handlerName` must match the namespace you pass to `EventManager.load()`.

## Usage (consumer side)

```ts
import { MyExtension } from '@yourscope/forge.extension'
import { ForgeClient } from '@tryforge/forgescript'

const ext = new MyExtension({ events: ['thingHappened'] })

const client = new ForgeClient({
    token: 'YOUR_TOKEN',
    prefixes: ['!'],
    extensions: [ext],
    commands: './commands',
})

client.login()
```

## Building

```bash
npm install
npm run build   # outputs to dist/
npm run dev     # runs src/__tests__/index.ts directly via ts-node
```

## Checklist before publishing

- [ ] Rename `MyExtension` everywhere to your actual extension name
- [ ] Update `name` in `package.json` and in the extension class
- [ ] Fill in real events in `IMyExtensionEvents`
- [ ] Delete the example functions or replace with real ones
- [ ] Set `version` in `package.json`
- [ ] Add `@tryforge/forgescript` to `peerDependencies` with the correct version range
