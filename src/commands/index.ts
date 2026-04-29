import { Telegraf } from 'telegraf';

import { helpCommand } from './help';
import { mySubscriptionCommand } from './mySubscription';
import { plansCommand } from './plans';
import { startCommand } from './start';

export function registerCommands(bot: Telegraf) {
	bot.command('start', startCommand);
	bot.command('plans', plansCommand);
	bot.command('help', helpCommand);
	bot.command('mysub', mySubscriptionCommand);

	console.log('✅ Commands registered');
}
