import { Scenes } from 'telegraf';

import { AppDataSource } from '../config/database';
import { Plan } from '../entities/Plan';
import { showMainMenu, showPlans } from '../handlers/actions';
import { paymentService } from '../services/payment';
import { subscriptionService } from '../services/subscription';

export const checkoutScene = new Scenes.BaseScene('checkout');

checkoutScene.enter(async (ctx: any) => {
	const planId = ctx.session.selectedPlanId;

	console.log('Checkout scene entered with planId:', planId);
	console.log('Full session:', ctx.session);

	if (!planId) {
		console.error('No planId found in session');
		await ctx.reply('Plano não selecionado. Volte ao menu de planos.');
		await ctx.scene.leave();
		return;
	}

	const planRepository = AppDataSource.getRepository(Plan);

	try {
		const plan = await planRepository.findOne({
			where: { id: planId, isActive: true },
		});

		if (!plan) {
			await ctx.reply('Plano não encontrado ou indisponível.');
			await ctx.scene.leave();
			return;
		}

		ctx.session.selectedPlan = plan;

		const billingCycleText: Record<string, string> = {
			monthly: '📅 Mensal',
			yearly: '📅 Anual',
			lifetime: '♾️ Vitalício',
		};

		const message = `
✅ *Confirmação de Compra*

*Plano Selecionado:* ${plan.name}
*Preço:* ${plan.price} ${plan.currency}
*Ciclo:* ${billingCycleText[plan.billingCycle]}

${plan.description ? `*Descrição:* ${plan.description}\n` : ''}

Deseja continuar com a compra?
		`;

		const keyboard = {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: '✅ Confirmar Pagamento', callback_data: `confirm_payment_${planId}` },
						{ text: '❌ Cancelar', callback_data: 'cancel_payment' },
					],
					[{ text: '⬅️ Voltar', callback_data: 'view_plans' }],
				],
			},
		};

		await ctx.editMessageText(message, {
			parse_mode: 'Markdown',
			...keyboard,
		});
	} catch (error) {
		console.error('Error in checkout scene:', error);
		await ctx.reply('Erro ao carregar plano. Tente novamente.');
		await ctx.scene.leave();
	}
});

checkoutScene.action(/^confirm_payment_/, async (ctx: any) => {
	const planId = ctx.session.selectedPlanId;
	const userId = ctx.from!.id;

	try {
		const planRepository = AppDataSource.getRepository(Plan);
		const plan = await planRepository.findOne({
			where: { id: planId, isActive: true },
		});

		if (!plan) {
			await ctx.reply('Plano não encontrado.');
			await ctx.scene.leave();
			return;
		}

		// 1. Create subscription FIRST
		const subscription = await subscriptionService.renewSubscription(planId, userId);

		if (!subscription) {
			throw new Error('Falha ao criar assinatura');
		}

		// 2. THEN create payment with the subscription ID
		const payment = await paymentService.createPayment({
			userId,
			subscriptionId: subscription.id, // Now we have the subscription ID
			amount: Number(plan.price),
			currency: plan.currency,
			paymentMethod: 'telegram_mock',
			description: `Purchase of ${plan.name} plan`,
		});

		// 3. Simulate payment completion (mock)
		await paymentService.mockPayment(payment.id);

		// 4. Update payment with external reference
		await paymentService.updatePayment(payment.id, {
			status: 'completed',
			externalPaymentId: `MOCK_${subscription.id}`,
		});

		const successMessage = `
✅ *Pagamento Realizado com Sucesso!*

*Transação ID:* \`${payment.id}\`
*Plano:* ${plan.name}
*Valor:* ${plan.price} ${plan.currency}
*Status:* ✅ Confirmado

Sua assinatura está ativa! Aproveite! 🎉
		`;

		await ctx.editMessageText(successMessage, {
			parse_mode: 'Markdown',
		});

		await ctx.scene.leave();
		await showMainMenu(ctx, 'reply');
	} catch (error) {
		console.error('Error confirming payment:', error);
		await ctx.editMessageText('❌ *Erro ao processar pagamento. Tente novamente.*', {
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'view_plans' }]],
			},
		});
		// await ctx.scene.leave();
	}
});

checkoutScene.action('cancel_payment', async (ctx: any) => {
	await ctx.editMessageText('❌ *Compra cancelada. Voltando ao menu de planos...*', {
		parse_mode: 'Markdown',
	});
	await ctx.scene.leave();
	await showPlans(ctx, 'reply');
});

checkoutScene.leave(async (ctx: any) => {
	delete ctx.session.selectedPlanId;
	delete ctx.session.selectedPlan;
});
