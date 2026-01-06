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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourConsumer = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rabbitmq_service_1 = require("./rabbitmq.service");
const reservationProcessed_entity_1 = require("../tour/entities/reservationProcessed.entity");
const tour_service_1 = require("../tour/tour.service");
let TourConsumer = class TourConsumer {
    constructor(rmq, processedRepo, tourService) {
        this.rmq = rmq;
        this.processedRepo = processedRepo;
        this.tourService = tourService;
    }
    async onModuleInit() {
        const channel = await this.rmq.getChannel();
        const { queue } = await channel.assertQueue('tour-service.reservation.requested', { durable: true });
        await channel.bindQueue(queue, 'tour.events', 'tour.reservation.requested');
        channel.consume(queue, async (msg) => {
            if (!msg)
                return;
            try {
                const data = JSON.parse(msg.content.toString());
                const exists = await this.processedRepo.findOne({
                    where: { reservation_id: data.reservationId },
                });
                if (exists) {
                    channel.ack(msg);
                    return;
                }
                await this.tourService.processReservationRequest(data);
                const rec = this.processedRepo.create({
                    reservation_id: data.reservationId,
                });
                await this.processedRepo.save(rec);
                channel.ack(msg);
            }
            catch (err) {
                console.error('Error procesando solicitud de reserva en TourService:', err.message);
                channel.ack(msg);
            }
        });
        console.log('TourConsumer suscrito a tour.reservation.requested');
    }
};
TourConsumer = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(reservationProcessed_entity_1.ReservationProcessed)),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        typeorm_2.Repository,
        tour_service_1.TourService])
], TourConsumer);
exports.TourConsumer = TourConsumer;
//# sourceMappingURL=tour.consumer.js.map