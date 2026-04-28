import { Scenes } from 'telegraf';

import { AppDataSource } from '../config/database';
import { Plan } from '../entities/Plan';
import { paymentService } from '../services/payment';
import { subscriptionService } from '../services/subscription';
import { backMenuKeyboard, confirmPaymentKeyboard } from '../utils/keyboards';

export const checkoutScene = new Scenes.BaseScene('checkout');

checkoutScene.enter(async (ctx: any) => {
	const planId = ctx.session.selectedPlanId;

	if (!planId) {
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

		await ctx.reply(message, {
			parse_mode: 'Markdown',
			...confirmPaymentKeyboard(planId),
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

		// Create payment record (mocked)
		const payment = await paymentService.createPayment({
			userId,
			subscriptionId: '', // Will be set after subscription creation
			amount: Number(plan.price),
			currency: plan.currency,
			paymentMethod: 'telegram_mock',
			description: `Purchase of ${plan.name} plan`,
		});

		// Simulate payment completion (mock)
		await paymentService.mockPayment(payment.id);

		// Create subscription
		const subscription = await subscriptionService.renewSubscription(planId, userId);

		// Update payment with subscription ID
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

		await ctx.reply(successMessage, {
			parse_mode: 'Markdown',
			...backMenuKeyboard(),
		});

		await ctx.scene.leave();
	} catch (error) {
		console.error('Error confirming payment:', error);
		await ctx.reply('Erro ao processar pagamento. Tente novamente.');
		await ctx.scene.leave();
	}
});

checkoutScene.action('cancel_payment', async (ctx: any) => {
	await ctx.reply('Compra cancelada. Voltando ao menu de planos...');
	await ctx.scene.leave();
});

checkoutScene.leave(async (ctx: any) => {
	delete ctx.session.selectedPlanId;
	delete ctx.session.selectedPlan;
});
