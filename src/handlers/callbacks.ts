import { Telegraf } from 'telegraf';

import { AppDataSource } from '../config/database';
import { Plan } from '../entities/Plan';
import { mainMenuKeyboard } from '../utils/keyboards';

export function registerCallbacks(bot: Telegraf) {
	// View Plans callback
	bot.action('view_plans', async (ctx: any) => {
		const planRepository = AppDataSource.getRepository(Plan);

		try {
			const plans = await planRepository.find({
				where: { isActive: true },
				order: { price: 'ASC' },
			});

			if (plans.length === 0) {
				await ctx.editMessageText('Nenhum plano disponível no momento.');
				return;
			}

			let message = '📋 *Planos Disponíveis*\n\n';

			plans.forEach((plan: Plan, index: number) => {
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
						...plans.map((plan: Plan) => [
							{
								text: `Comprar ${plan.name}`,
								callback_data: `buy_plan_${plan.id}`,
							},
						]),
						[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
					],
				},
			};

			await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
		} catch (error) {
			console.error('Error viewing plans:', error);
			await ctx.reply('Erro ao carregar planos. Tente novamente.');
		}
	});

	// Buy Plan callback
	bot.action(/^buy_plan_/, async (ctx: any) => {
		const planId = ctx.match[0].replace('buy_plan_', '');
		ctx.session.selectedPlanId = planId;

		try {
			await ctx.scene.enter('checkout');
		} catch (error) {
			console.error('Error entering checkout:', error);
			await ctx.reply('Erro ao iniciar checkout. Tente novamente.');
		}
	});

	// My Subscription callback
	bot.action('my_subscription', async (ctx: any) => {
		try {
			await ctx.scene.enter('subscription_management');
		} catch (error) {
			console.error('Error entering subscription scene:', error);
			await ctx.reply('Erro ao carregar assinatura. Tente novamente.');
		}
	});

	// Help callback
	bot.action('help', async (ctx: any) => {
		const helpText = `
❓ *AJUDA*

Aqui estão os comandos disponíveis:

/start - Retorna ao menu inicial
/plans - Visualiza todos os planos disponíveis
/mysub - Visualiza sua assinatura ativa
/help - Mostra esta mensagem

*Como Funciona:*
1. Use /plans para ver os planos disponíveis
2. Escolha o plano desejado
3. Complete o pagamento (mockado por enquanto)
4. Acesse seu plano com /mysub

*Suporte:*
Em caso de dúvidas, entre em contato conosco através do suporte.

Qualquer dúvida? 🤔
		`;

		const keyboard = {
			reply_markup: {
				inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }]],
			},
		};

		await ctx.editMessageText(helpText, { parse_mode: 'Markdown', ...keyboard });
	});

	// Scene leave callbacks
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

	// Back to menu callback
	bot.action('back_to_menu', async (ctx: any) => {
		const from = ctx.from!;

		const message = `Olá ${from.first_name}! 👋\n\nBem-vindo ao nosso serviço de assinaturas. Escolha uma opção:`;

		// Try to leave scene if in one
		try {
			await ctx.scene.leave();
		} catch (error) {
			// Not in a scene, ignore
		}

		await ctx.editMessageText(message, {
			parse_mode: 'Markdown',
			...mainMenuKeyboard(),
		});
	});

	console.log('✅ Callbacks registered');
}
