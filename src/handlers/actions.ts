import type { Context } from 'telegraf';

import { getPlansList, formatPlansMessage } from '../services/plansService';
import { getUserSubscription, formatSubscriptionMessage } from '../services/subscriptionService';

type SendMethod = 'reply' | 'edit';

const MAIN_MENU_IMAGE = 'https://www.nicelembrancinhas.com.br/image/cache/catalog/ASTRONAUTA/astronauta-foguete-vermelho-650x650.jpeg';

// const mainMenuKeyboard = {
// 	reply_markup: {
// 		inline_keyboard: [
// 			[{ text: '📋 Ver Planos', callback_data: 'view_plans' }],
// 			[{ text: '🔐 Minha Assinatura', callback_data: 'my_subscription' }],
// 			[{ text: '❓ Ajuda', callback_data: 'help' }],
// 		],
// 	},
// };

const isPhotoMessage = (ctx: Context) => {
	const message = ctx.callbackQuery?.message;
	return message && 'photo' in message && message.photo?.length > 0;
};

const formatToBRL = (value: number): string => {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value);
};

export async function showMainMenu(ctx: Context, method: SendMethod = 'edit') {
	const message = `*ACESSO PREMIUM — Consolidamos seu melhor conteúdo*

Chega de gastar com várias assinaturas. Aqui você encontra tudo em um único lugar.

*Nosso Catálogo:*
💎 ACESSO PREMIUM → OnlyFans · FanFever · CloseFans · Privacy · Xvideos
🎬 Conteúdo diverso e exclusivo
		- 🏳️‍🌈 LESBICAS
		- 🚫 NOVINHAS
		- 🔥 VAZADAS
		- 👄 BOQUETES  
		- 🙈 FAMILIA SACANA
		- 📱 LIVES +18
		- E muito mais...
📱 Conteúdo organizado · Suporte 24 horas
🔒 Acesso discreto · Download liberado
😊 Pagamento único · Sem assinatura!

*Benefícios Exclusivos:*
✓ Downloads liberados
✓ Pagamento único e seguro
✓ Sem renovações automáticas
✓ Acesso imediato ao seu painel

*Oferta Especial — Por Tempo Limitado:*
🎁 Bônus: 10 grupos exclusivos para novos membros
🛡️ Garantia de 7 dias — satisfeito ou seu dinheiro de volta
⏳ Vagas limitadas

*Escolha seu plano e comece agora!*`;

	const plans = await getPlansList();

	const keyboard = {
		reply_markup: {
			inline_keyboard: [
				...plans.map((plan) => [
					{
						text: `${plan.name} por ${formatToBRL(plan.price)}`,
						callback_data: `buy_plan_${plan.id}`,
						selectedPlanId: plan.id,
					},
				]),
			],
		},
	};

	if (method === 'edit') {
		if (isPhotoMessage(ctx)) {
			await ctx.editMessageCaption(message, { parse_mode: 'Markdown', ...keyboard });
		} else {
			await ctx.deleteMessage();
			await ctx.sendPhoto(MAIN_MENU_IMAGE, {
				caption: message,
				parse_mode: 'Markdown',
				...keyboard,
			});
		}
	} else {
		await ctx.sendPhoto(MAIN_MENU_IMAGE, {
			caption: message,
			parse_mode: 'Markdown',
			...keyboard,
		});
	}
}

export async function showPlans(ctx: any, method: SendMethod = 'edit') {
	try {
		const plans = await getPlansList();

		if (plans.length === 0) {
			const message = 'Nenhum plano disponível no momento.';
			const keyboard = {
				reply_markup: {
					inline_keyboard: [[{ text: '⬅️ Voltar', callback_data: 'back_to_menu' }]],
				},
			};

			if (method === 'edit') {
				if (isPhotoMessage(ctx)) {
					await ctx.deleteMessage();
					await ctx.reply(message, keyboard);
				} else {
					await ctx.editMessageText(message, keyboard);
				}
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
					[{ text: '⬅️ Voltar', callback_data: 'back_to_menu' }],
				],
			},
		};

		if (method === 'edit') {
			if (isPhotoMessage(ctx)) {
				await ctx.deleteMessage();
				await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
			} else {
				await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
			}
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
			inline_keyboard: [[{ text: '⬅️ Voltar', callback_data: 'back_to_menu' }]],
		},
	};

	if (method === 'edit') {
		if (isPhotoMessage(ctx)) {
			await ctx.deleteMessage();
			await ctx.reply(helpText, { parse_mode: 'Markdown', ...keyboard });
		} else {
			await ctx.editMessageText(helpText, { parse_mode: 'Markdown', ...keyboard });
		}
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
				if (isPhotoMessage(ctx)) {
					await ctx.deleteMessage();
					await ctx.reply(message, keyboard);
				} else {
					await ctx.editMessageText(message, keyboard);
				}
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
					[{ text: '⬅️ Voltar', callback_data: 'back_to_menu' }],
				],
			},
		};

		if (method === 'edit') {
			if (isPhotoMessage(ctx)) {
				await ctx.deleteMessage();
				await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
			} else {
				await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
			}
		} else {
			await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
		}
	} catch (error) {
		console.error('Error showing subscription:', error);
		await ctx.reply('Erro ao carregar assinatura. Tente novamente.');
	}
}
