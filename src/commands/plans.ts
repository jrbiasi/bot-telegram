import { Context } from 'telegraf';

import { AppDataSource } from '../config/database';
import { Plan } from '../entities/Plan';

export async function plansCommand(ctx: Context) {
	const planRepository = AppDataSource.getRepository(Plan);

	try {
		const plans = await planRepository.find({
			where: { isActive: true },
			order: { price: 'ASC' },
		});

		if (plans.length === 0) {
			await ctx.reply('Nenhum plano disponível no momento.', {
				reply_markup: {
					inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }]],
				},
			});
			return;
		}

		let message = '📋 *Planos Disponíveis*\n\n';

		plans.forEach((plan, index) => {
			message += `*${index + 1}. ${plan.name}*\n`;
			message += `💰 ${plan.price} ${plan.currency} - ${plan.billingCycle === 'lifetime' ? 'Vitalício' : `${plan.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}`}\n`;
			if (plan.description) {
				message += `${plan.description}\n`;
			}
			message += '\n';
		});

		const keyboard = {
			reply_markup: {
				inline_keyboard: [
					...plans.map((plan) => [
						{
							text: `Comprar ${plan.name}`,
							callback_data: `buy_plan_${plan.id}`,
						},
					]),
					[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
				],
			},
		};

		await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
	} catch (error) {
		console.error('Error in plansCommand:', error);
		await ctx.reply('Erro ao carregar planos. Tente novamente.');
	}
}
