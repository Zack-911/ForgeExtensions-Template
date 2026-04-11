import { ArgType, NativeFunction } from '@tryforge/forgescript'
import { MyExtension } from '../..'

// ─── $exampleFunction ─────────────────────────────────────────────────────────
// unwrap: true  →  ForgeScript resolves + type-coerces all args before calling
//                  execute. You receive (ctx, args) with args fully typed.
//
// Use this pattern for most functions. It's the simplest and safest.

export default new NativeFunction({
	name: '$exampleFunction',
	aliases: ['$example'],         // Optional aliases — all resolve to this fn.
	description: 'An example function that echoes a message.',
	version: '1.0.0',

	brackets: true,       	// true  = brackets required
	// false = brackets optional
	// undefined = no brackets at all

	unwrap: true,                  // Resolve args before execute.

	args: [
		{
			name: 'input',
			description: 'The text to echo back.',
			type: ArgType.String,
			required: true,
			rest: false,
		},
		{
			name: 'userId',
			description: 'A user to mention. Defaults to the command author.',
			type: ArgType.User,    // ForgeScript fetches the User object for you.
			required: false,
			rest: false,
		},
	],

	output: ArgType.String,        // Documents what this function returns.

	async execute(ctx, [input, user]) {
		// Access the extension's own state
		const ext = ctx.client.getExtension(MyExtension, true)
		void ext // (used here just to show the pattern — remove in real code)

		// Return helpers:
		//   this.success(value?)      — success, optionally with a return value
		//   this.successJSON(value)   — success, value is JSON-serialized
		//   this.customError(msg)     — runtime error with a custom message
		//   this.stop()               — silently halt execution (no error)

		const mention = user ? `<@${user.id}>` : `<@${ctx.user!.id}>`
		return this.success(`${mention} said: ${input}`)
	},
})
