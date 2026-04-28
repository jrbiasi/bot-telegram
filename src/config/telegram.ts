import { Telegraf, session, Scenes } from 'telegraf';

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
	throw new Error('BOT_TOKEN is not defined in environment variables');
}

export const bot = new Telegraf(botToken);

export const stage = new Scenes.Stage<any>([]);

bot.use(session());
bot.use(stage.middleware());
