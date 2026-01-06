"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
dotenv.config();
const typeorm_1 = require("@nestjs/typeorm");
const reservation_entity_1 = require("./reservation/entities/reservation.entity");
const reservation_module_1 = require("./reservation/reservation.module");
const rmq_module_1 = require("./rmq/rmq.module");
const bull_1 = require("@nestjs/bull");
const webhook_module_1 = require("./webhooks/webhook.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USER,
                password: String((_a = process.env.DB_PASSWORD) !== null && _a !== void 0 ? _a : ''),
                database: process.env.DB_NAME,
                entities: [reservation_entity_1.Reservation],
                synchronize: true,
            }),
            rmq_module_1.RmqModule,
            reservation_module_1.ReservationModule,
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    password: process.env.REDIS_PASSWORD,
                },
            }),
            webhook_module_1.WebhookModule,
        ],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map