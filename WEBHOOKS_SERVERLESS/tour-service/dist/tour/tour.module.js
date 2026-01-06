"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tour_entity_1 = require("./entities/tour.entity");
const outbox_entity_1 = require("./entities/outbox.entity");
const reservationProcessed_entity_1 = require("./entities/reservationProcessed.entity");
const tour_service_1 = require("./tour.service");
const tour_controller_1 = require("./tour.controller");
const tour_consumer_1 = require("../rmq/tour.consumer");
const rmq_module_1 = require("../rmq/rmq.module");
let TourModule = class TourModule {
};
TourModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tour_entity_1.Tour, outbox_entity_1.Outbox, reservationProcessed_entity_1.ReservationProcessed]),
            rmq_module_1.RmqModule,
        ],
        controllers: [tour_controller_1.TourController],
        providers: [tour_service_1.TourService, tour_consumer_1.TourConsumer],
        exports: [tour_service_1.TourService],
    })
], TourModule);
exports.TourModule = TourModule;
//# sourceMappingURL=tour.module.js.map