import { InlineKeyboardMarkup } from 'telegraf/types';

export const mainMenuKeyboard = (): InlineKeyboardMarkup => ({
	inline_keyboard: [
		[{ text: '📋 Ver Planos', callback_data: 'view_plans' }],
		[{ text: '🔐 Minha Assinatura', callback_data: 'my_subscription' }],
		[{ text: '❓ Ajuda', callback_data: 'help' }],
	],
});

export const confirmPaymentKeyboard = (planId: string): InlineKeyboardMarkup => ({
	inline_keyboard: [
		[
			{ text: '✅ Confirmar Pagamento', callback_data: `confirm_payment_${planId}` },
			{ text: '❌ Cancelar', callback_data: 'cancel_payment' },
		],
		[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
	],
});

export const subscriptionActionsKeyboard = (): InlineKeyboardMarkup => ({
	inline_keyboard: [
		[{ text: '🔄 Renovar', callback_data: 'renew_subscription' }],
		[{ text: '❌ Cancelar', callback_data: 'cancel_subscription' }],
		[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }],
	],
});

export const backMenuKeyboard = (): InlineKeyboardMarkup => ({
	inline_keyboard: [[{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }]],
});
