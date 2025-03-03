import { Client, GatewayIntentBits } from "discord.js";
import e from "express";

class LoggerService {
	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			]
		}),
		this.channelId = process.env.DISCORD_CHANNEL_ID,
		this.client.on("ready", () => {
			console.log(`Logged in as ${this.client.user.tag}`);
		});
		this.client.login(process.env.DISCORD_BOT_TOKEN);
	}

	sendCodeMessage(logData) {
		const { code, message, title } = logData;
		const codeMessage = {
			content: message,
			embeds: [{
				color: parseInt("00ff00", 16), // convert hex to decimal
				title,
				description: "```json\n" + JSON.stringify(code, null, 2) + "\n```"
			}]
		}

		this.sendMessage(codeMessage);
	}

	sendMessage(message) {
		const channel = this.client.channels.cache.get(this.channelId);
		if (!channel) {
			console.error("Channel not found");
			return;
		}

		channel.send(message).catch(e => console.error(e));
	}
}

export default new LoggerService();