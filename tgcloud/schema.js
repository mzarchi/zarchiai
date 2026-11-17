// tgcloud/schema.js
import { table, integer, text } from 'sdk/db';

export const memberLogs = table('member_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    join: integer('join', { mode: 'timestamp' }),
    left: integer('left', { mode: 'timestamp' }),
});