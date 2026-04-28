import { Telegraf } from 'telegraf';
import { startCommand } from './start';
import { plansCommand } from './plans';
import { helpCommand } from './help';
import { mySubscriptionCommand } from './mySubscription';

export function registerCommands(bot: Telegraf) {
  bot.command('start', startCommand);
  bot.command('plans', plansCommand);
  bot.command('help', helpCommand);
  bot.command('mysub', mySubscriptionCommand);

  console.log('✅ Commands registered');
}
