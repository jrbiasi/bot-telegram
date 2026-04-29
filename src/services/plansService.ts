import { AppDataSource } from '../config/database';
import { Plan } from '../entities/Plan';

export async function getPlansList() {
	const planRepository = AppDataSource.getRepository(Plan);
	return planRepository.find({
		where: { isActive: true },
		order: { price: 'ASC' },
	});
}

function formatBillingCycle(cycle: string): string {
	const cycles: Record<string, string> = {
		lifetime: 'Vitalício',
		monthly: 'Mensal',
		yearly: 'Anual',
	};
	return cycles[cycle] || cycle;
}

export function formatPlansMessage(plans: Plan[]): string {
	let message = '📋 *Planos Disponíveis*\n\n';

	plans.forEach((plan: Plan, index: number) => {
		message += `*${index + 1}. ${plan.name}*\n`;
		message += `💰 ${plan.price} ${plan.currency} - ${formatBillingCycle(plan.billingCycle)}\n`;
		if (plan.description) {
			message += `${plan.description}\n`;
		}
		message += '\n';
	});

	return message;
}
