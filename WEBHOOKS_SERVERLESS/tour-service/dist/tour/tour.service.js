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
exports.TourService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tour_entity_1 = require("./entities/tour.entity");
const outbox_entity_1 = require("./entities/outbox.entity");
let TourService = class TourService {
    constructor(tourRepository, outboxRepository, dataSource) {
        this.tourRepository = tourRepository;
        this.outboxRepository = outboxRepository;
        this.dataSource = dataSource;
    }
    async processReservationRequest(reservationData) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tour = await queryRunner.manager.findOne(tour_entity_1.Tour, {
                where: { id: reservationData.tourId },
            });
            if (!tour)
                throw new Error('Tour not found');
            if (tour.disponibles < reservationData.quantity) {
                await queryRunner.manager.save(outbox_entity_1.Outbox, {
                    aggregate_id: reservationData.tourId.toString(),
                    event_type: 'tour.reservation.rejected',
                    payload: {
                        reservationId: reservationData.reservationId,
                        tourId: reservationData.tourId,
                        reason: 'insufficient_availability',
                        requested: reservationData.quantity,
                        available: tour.disponibles,
                    },
                });
                await queryRunner.commitTransaction();
                return { success: false, reason: 'insufficient_availability' };
            }
            const oldAvailability = tour.disponibles;
            tour.disponibles -= reservationData.quantity;
            await queryRunner.manager.save(tour);
            await queryRunner.manager.save(outbox_entity_1.Outbox, {
                aggregate_id: reservationData.tourId.toString(),
                event_type: 'tour.reservation.confirmed',
                payload: {
                    reservationId: reservationData.reservationId,
                    tourId: reservationData.tourId,
                    quantity: reservationData.quantity,
                    availableSpots: tour.disponibles,
                    oldAvailability: oldAvailability,
                },
            });
            await queryRunner.manager.save(outbox_entity_1.Outbox, {
                aggregate_id: reservationData.tourId.toString(),
                event_type: 'tour.availability.updated',
                payload: {
                    tourId: reservationData.tourId,
                    newAvailability: tour.disponibles,
                    oldAvailability: oldAvailability,
                    reason: 'reservation_created',
                },
            });
            await queryRunner.commitTransaction();
            return { success: true, availableSpots: tour.disponibles };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
TourService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tour_entity_1.Tour)),
    __param(1, (0, typeorm_1.InjectRepository)(outbox_entity_1.Outbox)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], TourService);
exports.TourService = TourService;
//# sourceMappingURL=tour.service.js.map