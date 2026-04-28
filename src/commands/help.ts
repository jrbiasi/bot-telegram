import { Context } from 'telegraf';

export async function helpCommand(ctx: Context) {
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

  await ctx.reply(helpText, { parse_mode: 'Markdown' });
}
