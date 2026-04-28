import dotenv from 'dotenv';
import path from 'path';

// Load base .env file
dotenv.config({
	path: path.resolve(process.cwd(), '.env'),
});

// Load environment-specific .env file
if (process.env.NODE_ENV) {
	dotenv.config({
		path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
	});
}
