import { Context } from 'telegraf';

import { showSubscription } from '../handlers/actions';

export async function mySubscriptionCommand(ctx: Context) {
	await showSubscription(ctx, 'reply');
}
