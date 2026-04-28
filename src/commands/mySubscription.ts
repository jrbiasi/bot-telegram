import { Context } from 'telegraf';

import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';

export async function mySubscriptionCommand(ctx: Context) {
	const subscriptionRepository = AppDataSource.getRepository(Subscription);
	const userId = ctx.from!.id;

	try {
		const subscription = await subscriptionRepository.findOne({
			where: { userId, status: 'active' },
			relations: ['plan'],
		});

		if (!subscription) {
			const keyboard = {
				reply_markup: {
					inline_keyboard: [[{ text: '📋 Ver Planos', callback_data: 'view_plans' }]],
				},
			};

			await ctx.reply('Você não possui uma assinatura ativa no momento.', keyboard);
			return;
		}

		const statusEmoji: Record<string, string> = {
			active: '✅',
			cancelled: '❌',
			expired: '⏰',
			pending: '⏳',
		};

		const cycleText: Record<string, string> = {
			monthly: 'Mensal',
			yearly: 'Anual',
			lifetime: 'Vitalício',
		};

		const message = `
🎯 *Sua Assinatura*

*Plano:* ${subscription.plan.name}
*Status:* ${statusEmoji[subscription.status]} ${subscription.status.toUpperCase()}
*Ciclo:* ${cycleText[subscription.plan.billingCycle]}
*Preço:* ${subscription.plan.price} ${subscription.plan.price}

*Data de Início:* ${subscription.startDate.toLocaleDateString('pt-BR')}
*Data de Término:* ${subscription.endDate.toLocaleDateString('pt-BR')}

Aproveite seu acesso! 🎉
		`;

		const keyboard = {
			reply_markup: {
				inline_keyboard: [
					[{ text: '🔄 Renovar', callback_data: 'renew_subscription' }],
					[{ text: '❌ Cancelar', callback_data: 'cancel_subscription' }],
					[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
				],
			},
		};

		await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
	} catch (error) {
		console.error('Error in mySubscriptionCommand:', error);
		await ctx.reply('Erro ao carregar assinatura. Tente novamente.');
	}
}
