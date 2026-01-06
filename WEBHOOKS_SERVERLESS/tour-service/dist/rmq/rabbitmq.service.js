"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const amqplib_1 = require("amqplib");
let RabbitMQService = class RabbitMQService {
    async getChannel() {
        if (!this.channel) {
            const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            this.connection = await (0, amqplib_1.connect)(url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange('tour.events', 'topic', {
                durable: true,
            });
        }
        return this.channel;
    }
};
RabbitMQService = __decorate([
    (0, common_1.Injectable)()
], RabbitMQService);
exports.RabbitMQService = RabbitMQService;
//# sourceMappingURL=rabbitmq.service.js.map