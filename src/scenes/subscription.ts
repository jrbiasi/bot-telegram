import { Scenes } from 'telegraf';

import { subscriptionService } from '../services/subscription';
import { showMainMenu } from '../handlers/actions';

export const subscriptionScene = new Scenes.BaseScene('subscription_management');

subscriptionScene.enter(async (ctx: any) => {
	const userId = ctx.from!.id;

	try {
		const subscription = await subscriptionService.getUserActiveSubscription(userId);

		if (!subscription) {
			await ctx.reply('Você não possui uma assinatura ativa no momento.', {
				reply_markup: {
					inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }]],
				},
			});
			await ctx.scene.leave();
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

		await ctx.reply(message, {
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [
					[{ text: '🔄 Renovar', callback_data: 'renew_subscription' }],
					[{ text: '❌ Cancelar', callback_data: 'cancel_subscription' }],
					[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
				],
			},
		});
	} catch (error) {
		console.error('Error in subscription scene:', error);
		await ctx.reply('Erro ao carregar assinatura. Tente novamente.');
		await ctx.scene.leave();
	}
});

subscriptionScene.action('renew_subscription', async (ctx: any) => {
	const userId = ctx.from!.id;

	try {
		const subscription = await subscriptionService.getUserActiveSubscription(userId);

		if (!subscription) {
			await ctx.reply('Assinatura não encontrada.');
			await ctx.scene.leave();
			return;
		}

		const newSubscription = await subscriptionService.renewSubscription(subscription.planId, userId);

		const message = `
✅ *Assinatura Renovada com Sucesso!*

*Plano:* ${subscription.plan.name}
*Nova Data de Início:* ${newSubscription.startDate.toLocaleDateString('pt-BR')}
*Nova Data de Término:* ${newSubscription.endDate.toLocaleDateString('pt-BR')}

Sua assinatura foi renovada por mais um período! 🎉
		`;

		await ctx.reply(message, {
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }]],
			},
		});

		await ctx.scene.leave();
		await showMainMenu(ctx, 'reply');
	} catch (error) {
		console.error('Error renewing subscription:', error);
		await ctx.reply('Erro ao renovar assinatura. Tente novamente.');
		await ctx.scene.leave();
	}
});

subscriptionScene.action('cancel_subscription', async (ctx: any) => {
	const userId = ctx.from!.id;

	try {
		const subscription = await subscriptionService.getUserActiveSubscription(userId);

		if (!subscription) {
			await ctx.reply('Assinatura não encontrada.');
			await ctx.scene.leave();
			return;
		}

		await subscriptionService.cancelSubscription(subscription.id);

		const message = `
❌ *Assinatura Cancelada*

*Plano:* ${subscription.plan.name}
*Data do Cancelamento:* ${new Date().toLocaleDateString('pt-BR')}

Sentiremos sua falta! Se quiser retornar, é só usar /plans
		`;

		await ctx.reply(message, {
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }]],
			},
		});

		await ctx.scene.leave();
		await showMainMenu(ctx, 'reply');
	} catch (error) {
		console.error('Error cancelling subscription:', error);
		await ctx.reply('Erro ao cancelar assinatura. Tente novamente.');
		await ctx.scene.leave();
	}
});

subscriptionScene.leave(async () => {
	// Cleanup if needed
});
