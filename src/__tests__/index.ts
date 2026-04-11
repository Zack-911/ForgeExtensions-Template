import { ForgeClient, CommandType } from '@tryforge/forgescript'
import { MyExtension } from '..'

const ext = new MyExtension({
	events: ['exampleEvent'],
})

const client = new ForgeClient({
	token: process.env.DISCORD_TOKEN,
	intents: ['Guilds', 'GuildMessages', 'MessageContent'],
	prefixes: ['!'],
	events: ["messageCreate"],
	extensions: [ext],
})


client.commands.add({
	name: "eval",
	aliases: ["e", "ev"],
	type: "messageCreate",
	code: `
    $onlyForUsers[;$botOwnerID]
    $deleteCommand
    $eval[$message;false]
  `
})

client.commands.add({
	name: "update",
	aliases: ["up"],
	type: "messageCreate",
	code: `
    $onlyForUsers[;$botOwnerID]
    $deleteCommand
    $updateCommands
    $updateApplicationCommands
  `
})

client.commands.add({
	name: "ping",
	type: "messageCreate",
	code: `
    🏓 Ping: $pingms
  `
})

client.login()
