import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey()
});

export const stagedMoves = sqliteTable('staged_moves', {
	id: text('id').primaryKey(),
	game: text('match_id').references(() => game.id),
	x: integer('x'),
	y: integer('y'),
	tx: integer('tx'),
	ty: integer('ty')
});

export const game = sqliteTable('game', {
	id: text('id').primaryKey(),
	gameString: text('game_string')
});

export const match = sqliteTable('match', {
	id: text('id').primaryKey(),
	ongoing: integer('ongoing', { mode: 'boolean' }),
	team_one: text('team_one').references(() => users.id),
	team_two: text('team_two').references(() => users.id),
	game: text('game_id').references(() => game.id)
});
