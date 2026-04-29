import { Context } from 'telegraf';

import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { showMainMenu } from '../handlers/actions';

export async function startCommand(ctx: Context) {
	const userRepository = AppDataSource.getRepository(User);
	const from = ctx.from!;

	try {
		let user = await userRepository.findOne({
			where: { telegramId: from.id },
		});

		if (!user) {
			user = userRepository.create({
				telegramId: from.id,
				username: from.username,
				firstName: from.first_name,
				lastName: from.last_name,
				isBot: from.is_bot,
			});
			await userRepository.save(user);
			console.log(`👤 New user registered: ${from.id}`);
		}

		await showMainMenu(ctx, 'reply');
	} catch (error) {
		console.error('Error in startCommand:', error);
		await ctx.editMessageText('❌ *Erro ao processar comando. Tente novamente.*', {
			parse_mode: 'Markdown',
		});
	}
}
