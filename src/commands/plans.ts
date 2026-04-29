import { Context } from 'telegraf';

import { showPlans } from '../handlers/actions';

export async function plansCommand(ctx: Context) {
	await showPlans(ctx, 'reply');
}
