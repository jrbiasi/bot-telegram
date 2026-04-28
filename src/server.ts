import 'reflect-metadata';
import './config/env';

import { registerCommands } from './commands';
import { AppDataSource } from './config/database';
import { bot, stage } from './config/telegram';
import { registerCallbacks } from './handlers/callbacks';
import { loggingMiddleware } from './middleware/logging';
import { checkoutScene } from './scenes/checkout';
import { subscriptionScene } from './scenes/subscription';

async function main() {
	try {
		// Initialize Database
		await AppDataSource.initialize();
		console.log('✅ Database connection established');

		// Register scenes
		stage.register(checkoutScene);
		stage.register(subscriptionScene);
		console.log('✅ Scenes registered');

		// Register middleware
		bot.use(loggingMiddleware);

		// Register commands
		registerCommands(bot);

		// Register callbacks
		registerCallbacks(bot);

		// Error handler
		bot.catch((err, ctx) => {
			console.error('❌ Bot error:', err);
			ctx.reply('Desculpe, ocorreu um erro. Tente novamente mais tarde.').catch();
		});

		// Launch bot
		await bot.launch();
		console.log('🚀 Bot is running...');

		// Enable graceful stop
		process.once('SIGINT', () => {
			console.log('Stopping bot...');
			bot.stop('SIGINT');
			process.exit(0);
		});
		process.once('SIGTERM', () => {
			console.log('Stopping bot...');
			bot.stop('SIGTERM');
			process.exit(0);
		});
	} catch (error) {
		console.error('❌ Failed to start bot:', error);
		process.exit(1);
	}
}

main();
