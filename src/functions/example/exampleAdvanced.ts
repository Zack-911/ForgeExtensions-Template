import { ArgType, NativeFunction } from '@tryforge/forgescript'

// ─── $exampleAdvanced ────────────────────────────────────────────────────────
// unwrap: false  →  You receive only (ctx). You must resolve args manually.
//
// Use this pattern when:
//   • You need to conditionally resolve args (e.g. skip arg 2 if arg 1 fails).
//   • Some args are code blocks that should run as child code (rest: true +
//     resolveCode)
//   • You need fine-grained control over the resolution order.

export default new NativeFunction({
    name: '$exampleAdvanced',
    description: 'Demonstrates manual arg resolution and child code execution.',
    version: '1.0.0',
    brackets: true,
    unwrap: false,

    args: [
        {
            name: 'condition',
            description: 'A condition field (lhs op rhs).',
            type: ArgType.String,
            condition: true,       // Parsed as "lhs operator rhs" by the compiler.
            required: true,
            rest: false,
        },
        {
            name: 'code',
            description: 'Code to run if condition is true.',
            type: ArgType.Unknown,
            required: false,
            rest: true,            // rest: true = repeats until no more ; separators.
        },
    ],

    async execute(ctx) {
        // Resolve a single arg by index.
        // resolveUnhandledArg returns a Return object — always check isValidReturnType.
        const conditionReturn = await this['resolveUnhandledArg'](ctx, 0)
        if (!this['isValidReturnType'](conditionReturn)) return conditionReturn

        // For condition fields, the resolved value is already a boolean string ("true"/"false").
        if (conditionReturn.value !== 'true') return this.success()

        // Iterate over the rest fields (index 1 onward) and run each as child code.
        const fields = this.data.fields!
        for (let i = 1; i < fields.length; i++) {
            const result = await this['resolveCode'](ctx, fields[i])
            if (!this['isValidReturnType'](result)) return result
        }

        return this.success()
    },
})
