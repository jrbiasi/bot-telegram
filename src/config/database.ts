import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Payment } from '../entities/Payment';
import { Plan } from '../entities/Plan';
import { Subscription } from '../entities/Subscription';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
	type: 'mysql',
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '3306', 10),
	username: process.env.DB_USERNAME || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_DATABASE || 'telegram_bot',
	synchronize: process.env.NODE_ENV === 'development',
	logging: process.env.NODE_ENV === 'development',
	entities: [User, Plan, Subscription, Payment],
	migrations: ['src/migrations/*.ts'],
	subscribers: ['src/subscribers/*.ts'],
});
