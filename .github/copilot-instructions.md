# Telegram Subscription Bot - AI Development Guide

## 🎯 Project Overview

This is a **Telegram subscription sales bot** using:
- **Framework**: Telegraf (Telegram client) + TypeORM (MySQL ORM)
- **Language**: TypeScript with strict mode
- **Architecture**: Layered (Commands → Handlers → Scenes → Services → Entities)
- **Key Pattern**: State management via Telegraf sessions and scenes (interactive multi-step flows)

### Big Picture: User Flow
```
User /start (registration) 
  → Menu Callbacks (view_plans, my_subscription, help)
  → Scene Entry (checkout or subscription_management)
  → Service Layer (payment, subscription, user)
  → DB Persistence (MySQL via TypeORM)
  → Response with Navigation Buttons
```

---

## 🏗️ Architecture Decisions

### 1. **Layer Structure** (Why this way)
- **Commands** (`src/commands/`): `/start`, `/plans`, `/mysub`, `/help` - entry points
- **Handlers** (`src/handlers/callbacks.ts`): Inline button callbacks - state transitions
- **Scenes** (`src/scenes/`): Multi-step workflows - `checkout` and `subscription_management`
- **Services** (`src/services/`): Business logic - UserService, SubscriptionService, PaymentService
- **Entities** (`src/entities/`): TypeORM models with decorators - User, Plan, Subscription, Payment
- **DTOs** (`src/dtos/`): Interface contracts for API inputs/outputs

**Critical**: Services are instantiated as singletons (e.g., `export const userService = new UserService()`) and use `AppDataSource.getRepository()` for database access.

### 2. **Configuration Bootstrapping** (Critical Order)
File: `src/server.ts` imports **in this exact sequence**:
```typescript
import './config/env';  // ← MUST BE FIRST - loads .env files
import { bot } from './config/telegram';  // ← Uses process.env.BOT_TOKEN
import { AppDataSource } from './config/database';  // ← Uses DB env vars
```

`src/config/env.ts` loads `.env` then `.env.{NODE_ENV}` (development/production override).

### 3. **Scene Registration Pattern** (Why Sessions + Stages)
Telegraf uses `session()` middleware to store state per user:
- `ctx.session.selectedPlanId` - persists across callback chain
- `stage.register(scene)` - enables multi-step flows via `ctx.scene.enter('scene-name')`
- `ctx.scene.leave()` - exits scene and cleans up session data

**Example**: Checkout flow stores `selectedPlanId` → enters `checkout` scene → user confirms → payment processed → new Subscription created → scene exits.

### 4. **Callback vs Scene Decision**
- **Simple callbacks** (1-step): Use `bot.action('callback_name', handler)` in `handlers/callbacks.ts`
- **Multi-step flows**: Use Scenes in `src/scenes/` for sequential user interactions
- **Navigation**: `back_to_menu` callback uses `ctx.scene.leave()` to handle both simple actions and scene exits

---

## 🔌 Key Integration Points

### Database Initialization
```typescript
// src/config/database.ts
- Connects to MySQL via DataSource (TypeORM)
- Auto-syncs tables in development (synchronize: true)
- Entities: User, Plan, Subscription, Payment
```

### Telegram Bot Setup
```typescript
// src/config/telegram.ts
- Initializes bot with BOT_TOKEN
- Creates session() middleware for user state
- Creates stage with empty array (scenes registered at runtime in server.ts)
```

### Command Registration
```typescript
// src/commands/index.ts + src/server.ts
- registerCommands(bot) - maps /command → handler
- registerCallbacks(bot) - maps callback_data → handler
- stage.register() - adds scenes to stage middleware
```

---

## 📱 Common Workflows

### Adding a New Command
1. Create `src/commands/newcommand.ts`:
   ```typescript
   export async function newcommandCommand(ctx: Context) {
     // Use ctx.reply() for responses
     // Use keyboard objects for inline buttons
   }
   ```
2. Register in `src/commands/index.ts`:
   ```typescript
   bot.command('newcommand', newcommandCommand);
   ```
3. Test via `/newcommand` in Telegram

### Adding a New Scene (Multi-step Flow)
1. Create `src/scenes/newscene.ts`:
   ```typescript
   export const newscene = new Scenes.BaseScene('newscene');
   newscene.enter(async (ctx: any) => { /* entry logic */ });
   newscene.action('button_callback', async (ctx: any) => { /* handle button */ });
   ```
2. Register in `src/server.ts`:
   ```typescript
   stage.register(newscene);
   ```
3. Enter from callback:
   ```typescript
   await ctx.scene.enter('newscene');
   ```

### Adding a Database Entity
1. Create `src/entities/NewEntity.ts` with TypeORM decorators
2. Add to `src/config/database.ts` entities array
3. Create corresponding `src/dtos/newentity.dto.ts` for input/output contracts
4. Create `src/services/newentity.ts` service class

---

## 🛠️ Development Commands

```bash
npm run dev              # Start with ts-node-dev (hot reload + debugging)
```

**Built-in debugging**: `--inspect` flag enables Node debugger on port 9229.

---

## ⚙️ TypeScript/Build Configuration

### Path Aliases (Critical for Imports)
`tsconfig.json` defines:
```json
"@dtos/*": "src/dtos/*",
"@entities/*": "src/entities/*",
"@services/*": "src/services/*",
"@config/*": "src/config/*",
"@middleware/*": "src/middleware/*",
"@utils/*": "src/utils/*",
"@commands/*": "src/commands/*",
"@scenes/*": "src/scenes/*"
```

**Usage**: `import { userService } from '@services/user'` (not relative paths).

### Babel Config (Legacy Decorators Required)
`babel.config.js` plugin order matters:
1. `module-resolver` first (resolves imports)
2. `@babel/plugin-proposal-decorators` with `legacy: true`
3. `@babel/plugin-proposal-class-properties`

This enables TypeORM `@Entity`, `@Column` decorators on class instances.

### ESLint Conventions
- **Interface naming**: Must match `/^I[A-Z]/` (e.g., `IUserDTO` not `UserDTO`)
- **Indentation**: Tabs (4 spaces), not spaces
- **Imports**: Sorted by `import-helpers` plugin (modules → @paths → relative)
- **Trailing comma**: `es5` (no trailing comma in last param)

---

## 💾 Database Schema (TypeORM Entities)

### Core Relationships
```
User (telegramId PK) ──┬─ Subscriptions (1:N)
                       └─ Payments (1:N)

Plan (id PK uuid) ──── Subscriptions (1:N)

Subscription (id PK uuid) ──┬─ User (N:1)
                            ├─ Plan (N:1)
                            └─ Payments (1:N)

Payment (id PK uuid) ──┬─ User (N:1)
                       └─ Subscription (N:1)
```

### Service Layer Pattern
Each service (e.g., `UserService`) wraps repository access:
```typescript
export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  
  async createUser(data: CreateUserDTO): Promise<User> {
    // Business logic here
    return this.userRepository.save(...);
  }
}

export const userService = new UserService();  // Singleton instance
```

Use via: `userService.createUser(data)` - never direct repository access.

---

## 🎮 Inline Keyboard Patterns

All keyboards defined in `src/utils/keyboards.ts`:
```typescript
export const mainMenuKeyboard = (): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [{ text: '📋 Ver Planos', callback_data: 'view_plans' }],
    // ...
  ],
});
```

**Spread pattern** in responses:
```typescript
await ctx.reply(message, { parse_mode: 'Markdown', ...mainMenuKeyboard() });
```

**Return button**: `{ text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' }` in every keyboard for UX consistency.

---

## ⚠️ Common Pitfalls

1. **Missing `await ctx.scene.leave()`**: Scene state persists; always leave explicitly to prevent callback conflicts
2. **`.env` not loaded before imports**: MUST import `./config/env` first in `server.ts`
3. **`ctx.session` in callbacks without stage middleware**: Ensure `bot.use(stage.middleware())` called
4. **Direct repo access instead of services**: Always use `userService.getUser()`, not `getRepository(User).findOne()`
5. **Mixing tabs/spaces**: ESLint enforces tabs throughout; mixing breaks formatting

---

## 🔍 Debugging Tips

- **Session data**: `console.log(ctx.session)` to inspect user state
- **Database logging**: Enabled in development (see `logging: true` in database config)
- **Scene debugging**: Add `console.log('Entering scene X')` in `scene.enter()`
- **Callback routing**: Use regex patterns for dynamic callbacks: `bot.action(/^buy_plan_/, handler)`

---

## 📊 Payment System (Currently Mocked)

`PaymentService.mockPayment()` simulates approval by changing status to `completed`.

**Integration point**: Replace `mockPayment()` call in `src/scenes/checkout.ts` with actual gateway (Stripe, etc.).

---

## 🚀 Deployment Considerations

- Set `NODE_ENV=production` for optimizations
- Create `.env.production` with prod database credentials
- Disable `synchronize` in production (use migrations instead)
- Use process managers (PM2, systemd) for bot restarts

