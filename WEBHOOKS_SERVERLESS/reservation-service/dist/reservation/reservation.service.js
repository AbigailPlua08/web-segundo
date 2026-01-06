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
exports.ReservationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_entity_1 = require("./entities/reservation.entity");
const rabbitmq_service_1 = require("../rmq/rabbitmq.service");
let ReservationService = class ReservationService {
    constructor(reservationRepo, rmq) {
        this.reservationRepo = reservationRepo;
        this.rmq = rmq;
    }
    async createReservation(payload) {
        const existing = await this.reservationRepo.findOne({
            where: { reservation_id: payload.reservationId },
        });
        if (existing) {
            return {
                error: 'duplicate_reservation',
                message: 'ReservationId ya existe',
                reservationId: payload.reservationId,
            };
        }
        const reservation = this.reservationRepo.create({
            reservation_id: payload.reservationId,
            tour_id: payload.tourId,
            user_id: payload.userId,
            quantity: payload.quantity,
            reservation_date: payload.reservationDate,
            status: 'pending',
        });
        await this.reservationRepo.save(reservation);
        const channel = await this.rmq.getChannel();
        const body = Buffer.from(JSON.stringify(payload));
        await channel.publish('tour.events', 'tour.reservation.requested', body, {
            persistent: true,
        });
        return { success: true, reservationId: reservation.reservation_id };
    }
    async updateStatusFromEvent(eventType, payload) {
        const reservation = await this.reservationRepo.findOne({
            where: { reservation_id: payload.reservationId },
        });
        if (!reservation)
            return;
        if (eventType === 'tour.reservation.confirmed') {
            reservation.status = 'confirmed';
        }
        else if (eventType === 'tour.reservation.rejected') {
            reservation.status = 'rejected';
        }
        await this.reservationRepo.save(reservation);
    }
    async findByReservationId(reservationId) {
        return this.reservationRepo.findOne({
            where: { reservation_id: reservationId },
        });
    }
};
ReservationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rabbitmq_service_1.RabbitMQService])
], ReservationService);
exports.ReservationService = ReservationService;
//# sourceMappingURL=reservation.service.js.map