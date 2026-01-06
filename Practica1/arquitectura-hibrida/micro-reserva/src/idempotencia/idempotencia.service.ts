import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class IdempotenciaService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly ttlSeconds: number;
  private readonly logger = new Logger(IdempotenciaService.name);

  constructor(config: ConfigService) {
    this.ttlSeconds = Number(config.get<number>('REDIS_TTL_SECONDS', 3600));
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: Number(config.get<number>('REDIS_PORT', 6379)),
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async execute<T>(
    key: string,
    handler: () => Promise<T>
  ): Promise<{ result: T; duplicate: boolean }> {
    const lockKey = this.buildLockKey(key);
    const resultKey = this.buildResultKey(key);

    const lockAcquired = await this.redis.set(
      lockKey,
      '1',
      'EX',
      this.ttlSeconds,
      'NX'
    );
    if (!lockAcquired) {
      const storedResult = await this.redis.get(resultKey);
      if (storedResult) {
        this.logger.debug(`Reutilizando resultado idempotente para ${key}`);
        return { result: JSON.parse(storedResult) as T, duplicate: true };
      }

      throw new Error(
        'Operación idempotente en progreso, reintentar más tarde.'
      );
    }

    try {
      const result = await handler();
      await this.redis.set(
        resultKey,
        JSON.stringify(result),
        'EX',
        this.ttlSeconds
      );
      await this.redis.set(lockKey, 'processed', 'EX', this.ttlSeconds);
      return { result, duplicate: false };
    } catch (error) {
      await this.redis.del(lockKey);
      throw error;
    }
  }

  private buildLockKey(key: string) {
    return `idempotency:${key}:lock`;
  }

  private buildResultKey(key: string) {
    return `idempotency:${key}:result`;
  }
}
