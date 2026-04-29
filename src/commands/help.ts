import { Context } from 'telegraf';

import { showHelp } from '../handlers/actions';

export async function helpCommand(ctx: Context) {
	await showHelp(ctx, 'reply');
}
