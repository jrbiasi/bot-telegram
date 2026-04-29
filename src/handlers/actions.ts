import { getPlansList, formatPlansMessage } from '../services/plansService';
import { getUserSubscription, formatSubscriptionMessage } from '../services/subscriptionService';

type SendMethod = 'reply' | 'edit';

const mainMenuKeyboard = {
	reply_markup: {
		inline_keyboard: [
			[{ text: '📋 Ver Planos', callback_data: 'view_plans' }],
			[{ text: '🔐 Minha Assinatura', callback_data: 'my_subscription' }],
			[{ text: '❓ Ajuda', callback_data: 'help' }],
		],
	},
};

export async function showMainMenu(ctx: any, method: SendMethod = 'edit') {
	const from = ctx.from!;
	const message = `Olá ${from.first_name}! 👋\n\nBem-vindo ao nosso serviço de assinaturas. Escolha uma opção:`;

	if (method === 'edit') {
		await ctx.editMessageText(message, { parse_mode: 'Markdown', ...mainMenuKeyboard });
	} else {
		await ctx.reply(message, mainMenuKeyboard);
	}
}

export async function showPlans(ctx: any, method: SendMethod = 'edit') {
	try {
		const plans = await getPlansList();

		if (plans.length === 0) {
			const message = 'Nenhum plano disponível no momento.';
			const keyboard = {
				reply_markup: {
					inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }]],
				},
			};

			if (method === 'edit') {
				await ctx.editMessageText(message, keyboard);
			} else {
				await ctx.reply(message, keyboard);
			}
			return;
		}

		const message = formatPlansMessage(plans);
		const keyboard = {
			reply_markup: {
				inline_keyboard: [
					...plans.map((plan) => [
						{
							text: `Comprar ${plan.name}`,
							callback_data: `buy_plan_${plan.id}`,
							selectedPlanId: plan.id,
						},
					]),
					[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
				],
			},
		};

		if (method === 'edit') {
			await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
		} else {
			await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
		}
	} catch (error) {
		console.error('Error showing plans:', error);
		await ctx.reply('Erro ao carregar planos. Tente novamente.');
	}
}

export async function showHelp(ctx: any, method: SendMethod = 'edit') {
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

	if (method === 'edit') {
		await ctx.editMessageText(helpText, { parse_mode: 'Markdown', ...keyboard });
	} else {
		await ctx.reply(helpText, { parse_mode: 'Markdown', ...keyboard });
	}
}

export async function showSubscription(ctx: any, method: SendMethod = 'edit') {
	const userId = ctx.from!.id;

	try {
		const subscription = await getUserSubscription(userId);

		if (!subscription) {
			const message = 'Você não possui uma assinatura ativa no momento.';
			const keyboard = {
				reply_markup: {
					inline_keyboard: [[{ text: '📋 Ver Planos', callback_data: 'view_plans' }]],
				},
			};

			if (method === 'edit') {
				await ctx.editMessageText(message, keyboard);
			} else {
				await ctx.reply(message, keyboard);
			}
			return;
		}

		const message = formatSubscriptionMessage(subscription);
		const keyboard = {
			reply_markup: {
				inline_keyboard: [
					[{ text: '🔄 Renovar', callback_data: 'renew_subscription' }],
					[{ text: '❌ Cancelar', callback_data: 'cancel_subscription' }],
					[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
				],
			},
		};

		if (method === 'edit') {
			await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
		} else {
			await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
		}
	} catch (error) {
		console.error('Error showing subscription:', error);
		await ctx.reply('Erro ao carregar assinatura. Tente novamente.');
	}
}
