import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';

export async function getUserSubscription(userId: number) {
	const subscriptionRepository = AppDataSource.getRepository(Subscription);
	return subscriptionRepository.findOne({
		where: { userId, status: 'active' },
		relations: ['plan'],
	});
}

export function formatSubscriptionMessage(subscription: Subscription): string {
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

	return `
🎯 *Sua Assinatura*

*Plano:* ${subscription.plan.name}
*Status:* ${statusEmoji[subscription.status]} ${subscription.status.toUpperCase()}
*Ciclo:* ${cycleText[subscription.plan.billingCycle]}
*Preço:* ${subscription.plan.price} ${subscription.plan.currency}

*Data de Início:* ${subscription.startDate.toLocaleDateString('pt-BR')}
*Data de Término:* ${subscription.endDate.toLocaleDateString('pt-BR')}

Aproveite seu acesso! 🎉
	`;
}
