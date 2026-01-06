"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxWorker = void 0;
const amqplib_1 = require("amqplib");
const pg_1 = require("pg");
class OutboxWorker {
    constructor() {
        this.pgClient = new pg_1.Client({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
    }
    async start() {
        await this.pgClient.connect();
        await this.pgClient.query('LISTEN outbox_channel');
        this.connection = await (0, amqplib_1.connect)(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange('tour.events', 'topic', {
            durable: true,
        });
        this.pgClient.on('notification', async (msg) => {
            try {
                const payload = JSON.parse(msg.payload || '{}');
                await this.processOutboxMessage(payload.id);
            }
            catch (error) {
                console.error('Error processing notification:', error);
            }
        });
        await this.processPendingMessages();
        console.log('CDC Outbox Worker started successfully');
    }
    async processOutboxMessage(outboxId) {
        const query = `SELECT * FROM outbox WHERE id = $1 AND NOT processed FOR UPDATE SKIP LOCKED`;
        const result = await this.pgClient.query(query, [outboxId]);
        if (result.rows.length > 0) {
            const message = result.rows[0];
            await this.channel.publish('tour.events', message.event_type, Buffer.from(JSON.stringify(message.payload)), { persistent: true });
            await this.pgClient.query('UPDATE outbox SET processed = true WHERE id = $1', [outboxId]);
            console.log(`Published event: ${message.event_type} for tour ${message.aggregate_id}`);
        }
    }
    async processPendingMessages() {
        const query = `SELECT id FROM outbox WHERE NOT processed ORDER BY created_at ASC LIMIT 100`;
        const result = await this.pgClient.query(query);
        for (const row of result.rows) {
            await this.processOutboxMessage(row.id);
        }
    }
}
exports.OutboxWorker = OutboxWorker;
//# sourceMappingURL=outbox-worker.js.map