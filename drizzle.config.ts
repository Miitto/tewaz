import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './schema/*',
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DB_PATH || 'db.sqlite'
	}
});
