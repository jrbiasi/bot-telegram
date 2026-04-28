import { Context } from 'telegraf';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export async function startCommand(ctx: Context) {
  const userRepository = AppDataSource.getRepository(User);
  const from = ctx.from!;

  try {
    let user = await userRepository.findOne({
      where: { telegramId: from.id },
    });

    if (!user) {
      user = userRepository.create({
        telegramId: from.id,
        username: from.username,
        firstName: from.first_name,
        lastName: from.last_name,
        isBot: from.is_bot,
      });
      await userRepository.save(user);
      console.log(`👤 New user registered: ${from.id}`);
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Ver Planos', callback_data: 'view_plans' }],
          [{ text: '🔐 Minha Assinatura', callback_data: 'my_subscription' }],
          [{ text: '❓ Ajuda', callback_data: 'help' }],
        ],
      },
    };

    await ctx.reply(
      `Olá ${from.first_name}! 👋\n\nBem-vindo ao nosso serviço de assinaturas. Escolha uma opção:`,
      keyboard
    );
  } catch (error) {
    console.error('Error in startCommand:', error);
    await ctx.reply('Erro ao processar comando. Tente novamente.');
  }
}
