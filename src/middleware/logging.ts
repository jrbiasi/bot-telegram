import { Context, Middleware } from 'telegraf';

export const loggingMiddleware: Middleware<Context> = async (ctx, next) => {
  const start = Date.now();
  const from = ctx.from;

  console.log(`📩 [${new Date().toISOString()}] User @${from?.username || from?.id}`);

  await next();

  const ms = Date.now() - start;
  console.log(`✅ Response time: ${ms}ms`);
};
