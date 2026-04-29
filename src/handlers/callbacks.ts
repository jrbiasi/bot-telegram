import { Telegraf } from 'telegraf';

import { showMainMenu, showPlans, showHelp, showSubscription } from './actions';

export function registerCallbacks(bot: Telegraf) {
	bot.action('view_plans', async (ctx: any) => {
		try {
			// Se estiver em uma cena, saia dela primeiro
			if (ctx.scene && ctx.scene.current) {
				await ctx.scene.leave();
			}
			await showPlans(ctx, 'edit');
		} catch (error) {
			console.error('Error in view_plans:', error);
			await ctx.reply('Erro ao carregar planos. Tente novamente.');
		}
	});

	bot.action(/^buy_plan_(.+)$/, async (ctx: any) => {
		const planId = ctx.match[1];

		console.log('Buy plan clicked with planId:', planId);

		if (!planId) {
			await ctx.reply('Plano inválido. Tente novamente.');
			return;
		}

		// Garantir que não há sessão anterior contaminada
		ctx.session.selectedPlanId = planId;
		ctx.session.selectedPlan = null;

		console.log('Session set to:', ctx.session);

		try {
			await ctx.scene.enter('checkout');
		} catch (error) {
			console.error('Error entering checkout:', error);
			await ctx.reply('Erro ao iniciar checkout. Tente novamente.');
		}
	});

	bot.action('my_subscription', async (ctx: any) => {
		try {
			await showSubscription(ctx, 'edit');
		} catch (error) {
			console.error('Error in my_subscription:', error);
			await ctx.reply('Erro ao carregar assinatura. Tente novamente.');
		}
	});

	bot.action('help', async (ctx: any) => {
		try {
			await showHelp(ctx, 'edit');
		} catch (error) {
			console.error('Error in help:', error);
			await ctx.reply('Erro ao carregar ajuda. Tente novamente.');
		}
	});

	bot.action('renew_subscription', async (ctx: any) => {
		try {
			await ctx.scene.enter('subscription_management');
		} catch (error) {
			console.error('Error in renew subscription:', error);
			await ctx.reply('Erro ao renovar assinatura. Tente novamente.');
		}
	});

	bot.action('cancel_subscription', async (ctx: any) => {
		try {
			await ctx.scene.enter('subscription_management');
		} catch (error) {
			console.error('Error in cancel subscription:', error);
			await ctx.reply('Erro ao cancelar assinatura. Tente novamente.');
		}
	});

	bot.action('back_to_menu', async (ctx: any) => {
		try {
			if (ctx.scene && ctx.scene.current) {
				await ctx.scene.leave();
			}
		} catch {
			// Not in a scene, ignore
		}

		try {
			await showMainMenu(ctx, 'edit');
		} catch (error) {
			console.error('Error in back_to_menu:', error);
			await ctx.reply('Erro ao voltar ao menu. Tente novamente.');
		}
	});

	console.log('✅ Callbacks registered');
}
