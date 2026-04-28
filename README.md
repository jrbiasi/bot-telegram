# 🤖 Telegram Subscription Bot

A production-ready Telegram bot for managing subscription sales with integrated payment processing, user management, and flexible billing cycles.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-4.16-blue?logo=telegram)](https://telegraf.js.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3-red?logo=typescript)](https://typeorm.io/)
[![MySQL](https://img.shields.io/badge/MySQL-3.22-blue?logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## ✨ Features

- 🔐 **User Management**: Automatic user registration via Telegram
- 💳 **Subscription Plans**: Create and manage multiple subscription tiers
- 🛒 **Checkout Flow**: Multi-step purchase experience with confirmation
- 💰 **Payment Processing**: Mocked payment system (ready for Stripe/Mercado Pago integration)
- 🔄 **Subscription Lifecycle**: Renewal and cancellation management
- 📊 **Billing Cycles**: Support for monthly, yearly, and lifetime plans
- 🗄️ **Database**: TypeORM with MySQL for reliable data persistence
- 🎯 **State Management**: Telegraf sessions for seamless multi-step interactions
- 🚀 **Hot Reload**: Development server with ts-node-dev for fast iteration
- 📝 **Type-Safe**: Full TypeScript with strict mode enabled

## 📋 Prerequisites

- **Node.js** ≥ 16.0.0
- **MySQL** ≥ 5.7
- **Telegram Bot Token** (from [@BotFather](https://t.me/botfather))

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd telegram-subscription-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.development`:

```env
BOT_TOKEN=your_bot_token_here
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=telegram_bot
NODE_ENV=development
PORT=3000
```

### 4. Create Database

```bash
mysql -u root -p -e "CREATE DATABASE telegram_bot;"
```

### 5. Start Development Server

```bash
npm run dev
```

The bot will:

- Load environment variables from `.env.development`
- Connect to MySQL database
- Register Telegram commands
- Start listening for user interactions

## 📱 Usage

### Commands

| Command  | Description                           |
| -------- | ------------------------------------- |
| `/start` | Register user and access main menu    |
| `/plans` | View all available subscription plans |
| `/mysub` | Check your active subscription        |
| `/help`  | Display help information              |

### User Journey

```
1. User types /start
   ↓
2. Bot registers user in database
   ↓
3. User sees menu: [📋 Plans] [🔐 My Subscription] [❓ Help]
   ↓
4. Click "📋 Plans" → View all available plans
   ↓
5. Click "💳 Buy [Plan]" → Enter checkout scene
   ↓
6. Click "✅ Confirm Payment" → Payment processed
   ↓
7. Click "🏠 Back to Menu" → Return to main menu
```

## 🏗️ Project Structure

```
src/
├── server.ts                    # Entry point
├── config/
│   ├── env.ts                  # Environment variable loading
│   ├── database.ts             # TypeORM database configuration
│   └── telegram.ts             # Telegraf bot setup
├── commands/
│   ├── start.ts                # /start command
│   ├── plans.ts                # /plans command
│   ├── help.ts                 # /help command
│   ├── mySubscription.ts       # /mysub command
│   └── index.ts                # Command registration
├── handlers/
│   ├── callbacks.ts            # Inline button callbacks
│   └── index.ts                # Handler exports
├── scenes/
│   ├── checkout.ts             # Multi-step checkout flow
│   └── subscription.ts         # Subscription management scene
├── services/
│   ├── user.ts                 # User business logic
│   ├── subscription.ts         # Subscription business logic
│   └── payment.ts              # Payment processing (mocked)
├── entities/
│   ├── User.ts                 # User entity
│   ├── Plan.ts                 # Plan entity
│   ├── Subscription.ts         # Subscription entity
│   └── Payment.ts              # Payment entity
├── dtos/
│   ├── user.dto.ts             # User DTOs
│   ├── plan.dto.ts             # Plan DTOs
│   └── payment.dto.ts          # Payment DTOs
├── middleware/
│   └── logging.ts              # Request logging middleware
└── utils/
    └── keyboards.ts            # Telegram keyboard templates
```

## 💾 Database Schema

### Users Table

```sql
CREATE TABLE users (
  telegramId BIGINT PRIMARY KEY,
  username VARCHAR(255),
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  phoneNumber VARCHAR(255),
  isBot BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Plans Table

```sql
CREATE TABLE plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency VARCHAR(3),
  billingCycle ENUM('monthly', 'yearly', 'lifetime'),
  features TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  userId BIGINT,
  planId VARCHAR(36),
  status ENUM('active', 'cancelled', 'expired', 'pending'),
  startDate DATETIME,
  endDate DATETIME,
  cancelledAt DATETIME,
  externalSubscriptionId VARCHAR(255),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(telegramId),
  FOREIGN KEY (planId) REFERENCES plans(id)
);
```

### Payments Table

```sql
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  userId BIGINT,
  subscriptionId VARCHAR(36),
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  externalPaymentId VARCHAR(255),
  paymentMethod VARCHAR(50),
  description TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(telegramId),
  FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id)
);
```

## 🔌 Architecture

### Layered Architecture

The project follows a clean layered architecture:

```
Commands (Entry Points)
        ↓
Handlers (State Transitions)
        ↓
Scenes (Multi-step Flows)
        ↓
Services (Business Logic)
        ↓
Entities (Data Models)
        ↓
Database (Persistence)
```

### Key Patterns

**Services as Singletons**

```typescript
export class UserService {
	private userRepository = AppDataSource.getRepository(User);
	// ...
}

export const userService = new UserService();
```

**Scene Registration**

```typescript
const stage = new Scenes.Stage<any>([]);
stage.register(checkoutScene);
stage.register(subscriptionScene);
bot.use(stage.middleware());
```

**Callback Routing**

```typescript
bot.action('view_plans', viewPlansHandler);
bot.action(/^buy_plan_/, buyPlanHandler);
```

## 🛠️ Development

### Start Development Server

```bash
npm run dev
```

Features:

- Hot reload on file changes
- TypeScript transpilation
- Node debugger on port 9229
- Database logging in development

### Code Style

This project enforces:

- **Indentation**: Tabs (4 spaces)
- **Formatting**: Prettier with custom config
- **Linting**: ESLint with TypeScript support
- **Type Safety**: Strict TypeScript mode

### Type Checking

Interfaces must follow naming convention:

```typescript
// ✅ Correct
interface IUserDTO {
	telegramId: number;
}

// ❌ Wrong
interface UserDTO {
	telegramId: number;
}
```

## 🔐 Security Considerations

⚠️ **Important**: The `.env.development` token is for development only!

Before deploying:

1. **Revoke bot token** in [@BotFather](https://t.me/botfather)
2. **Generate new token**
3. **Use `.env.production`** with secure credentials
4. **Enable HTTPS** for webhooks
5. **Implement rate limiting**
6. **Use environment variables** for all secrets

## 💳 Payment Integration

Currently, the payment system is **mocked** for development:

```typescript
// In src/services/payment.ts
async mockPayment(paymentId: string): Promise<Payment | null> {
  return this.updatePayment(paymentId, { status: 'completed' });
}
```

### To integrate a real payment gateway:

1. **Replace** `mockPayment()` in `src/services/payment.ts`
2. **Implement** actual gateway API calls (Stripe, Mercado Pago, etc.)
3. **Handle** webhook callbacks from payment provider
4. **Update** payment status based on provider response

Example (Stripe):

```typescript
async processPaymentWithStripe(
  userId: number,
  amount: number,
  planId: string
): Promise<Payment> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'brl',
    metadata: { userId, planId }
  });

  // Save to database
  return this.createPayment({ /* ... */ });
}
```

## 📊 Billing Cycles

| Cycle      | Duration   | Use Case                   |
| ---------- | ---------- | -------------------------- |
| `monthly`  | 30 days    | Standard subscriptions     |
| `yearly`   | 365 days   | Annual plans with discount |
| `lifetime` | ~100 years | One-time purchases         |

Calculated via `dayjs` in `SubscriptionService.renewSubscription()`.

## 🔍 Debugging

### View Session Data

```typescript
console.log(ctx.session);
```

### Enable Database Logging

Automatically enabled in development (see `database.ts`).

### Scene Entry/Exit Debugging

```typescript
scene.enter(async (ctx) => {
	console.log('Entering scene:', scene.id);
	// ...
});
```

### Dynamic Callback Routing

```typescript
// Use regex for parametric callbacks
bot.action(/^buy_plan_(.+)/, (ctx) => {
	const planId = ctx.match[1];
	// ...
});
```

## 🚀 Deployment

### Environment Setup

Create `.env.production`:

```env
BOT_TOKEN=prod_token
DB_HOST=prod.db.host
DB_PORT=3306
DB_USERNAME=prod_user
DB_PASSWORD=prod_password
DB_DATABASE=telegram_bot_prod
NODE_ENV=production
```

### Important Settings

```typescript
// In src/config/database.ts - DISABLE auto-sync in production
export const AppDataSource = new DataSource({
	// ...
	synchronize: false, // Use migrations instead
	logging: false, // Disable logging for performance
});
```

### Using Process Managers

**PM2**:

```bash
npm install -g pm2
pm2 start src/server.ts --name telegram-bot
pm2 save
```

**Systemd**:

```ini
[Unit]
Description=Telegram Subscription Bot
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/app
ExecStart=/usr/bin/node /app/dist/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📚 Documentation Files

- **[`.github/copilot-instructions.md`](.github/copilot-instructions.md)** - AI development guide

## 🐛 Troubleshooting

### "BOT_TOKEN is not defined"

**Solution**: Check `.env.development` exists and has `BOT_TOKEN`

### "Cannot connect to database"

**Solution**: Verify MySQL is running and credentials are correct

### "Button does not respond"

**Solution**: Ensure scenes are registered in `server.ts` before launching bot

### "Session data not persisting"

**Solution**: Verify `bot.use(session())` is called before scene middleware

## 🤝 Contributing

1. Follow the layered architecture
2. Use TypeScript with strict mode
3. Write tabs (not spaces) for indentation
4. Follow ESLint rules
5. Add appropriate DTOs for data validation
6. Create services for business logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Telegraf Documentation](https://telegraf.js.org/)
- [TypeORM Documentation](https://typeorm.io/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Version**: 1.1.0  
**Last Updated**: April 2026  
**Status**: ✅ Production Ready
