"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationConsumer = void 0;
const common_1 = require("@nestjs/common");
const reservation_service_1 = require("../reservation/reservation.service");
const rabbitmq_service_1 = require("./rabbitmq.service");
let ReservationConsumer = class ReservationConsumer {
    constructor(rmq, reservationService) {
        this.rmq = rmq;
        this.reservationService = reservationService;
    }
    async onModuleInit() {
        const channel = await this.rmq.getChannel();
        const confirmedQueue = await channel.assertQueue('reservation-service.confirmed', { durable: true });
        await channel.bindQueue(confirmedQueue.queue, 'tour.events', 'tour.reservation.confirmed');
        const rejectedQueue = await channel.assertQueue('reservation-service.rejected', { durable: true });
        await channel.bindQueue(rejectedQueue.queue, 'tour.events', 'tour.reservation.rejected');
        channel.consume(confirmedQueue.queue, async (msg) => {
            if (!msg)
                return;
            const payload = JSON.parse(msg.content.toString());
            await this.reservationService.updateStatusFromEvent('tour.reservation.confirmed', payload);
            channel.ack(msg);
        });
        channel.consume(rejectedQueue.queue, async (msg) => {
            if (!msg)
                return;
            const payload = JSON.parse(msg.content.toString());
            await this.reservationService.updateStatusFromEvent('tour.reservation.rejected', payload);
            channel.ack(msg);
        });
        console.log('ReservationConsumer suscrito a confirm/reject');
    }
};
ReservationConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        reservation_service_1.ReservationService])
], ReservationConsumer);
exports.ReservationConsumer = ReservationConsumer;
//# sourceMappingURL=reservation.consumer.js.map