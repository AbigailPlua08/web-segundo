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
exports.WebhookSubscription = void 0;
const typeorm_1 = require("typeorm");
let WebhookSubscription = class WebhookSubscription {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WebhookSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], WebhookSubscription.prototype, "event_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], WebhookSubscription.prototype, "subscriber_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], WebhookSubscription.prototype, "secret_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], WebhookSubscription.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'{", "max_attempts": ": 3, ", "backoff_factor": ": 2}'" }),
    __metadata("design:type", Object)
], WebhookSubscription.prototype, "retry_config", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], WebhookSubscription.prototype, "created_at", void 0);
WebhookSubscription = __decorate([
    (0, typeorm_1.Entity)('webhook_subscriptions')
], WebhookSubscription);
exports.WebhookSubscription = WebhookSubscription;
//# sourceMappingURL=webhook-subscription.entity.js.map