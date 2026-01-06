import { ConfigService } from '@nestjs/config';
import { IdempotenciaService } from './idempotencia.service';

jest.mock('ioredis', () => {
  const MockRedis = require('ioredis-mock');
  return { __esModule: true, default: MockRedis };
});

type ConfigOverrides = Record<string, unknown>;

function createConfig(overrides: ConfigOverrides = {}): ConfigService {
  return {
    get: jest.fn(
      (key: string, defaultValue?: unknown) => overrides[key] ?? defaultValue
    ),
  } as unknown as ConfigService;
}

describe('IdempotenciaService', () => {
  it('almacena y reutiliza el resultado de una operación idempotente', async () => {
    const service = new IdempotenciaService(
      createConfig({ REDIS_TTL_SECONDS: 30 })
    );

    const handler = jest.fn().mockResolvedValue({ ok: true });

    const first = await service.execute('reserva-1', handler);
    expect(first.duplicate).toBe(false);
    expect(first.result).toEqual({ ok: true });
    expect(handler).toHaveBeenCalledTimes(1);

    const secondHandler = jest.fn();
    const second = await service.execute('reserva-1', secondHandler);
    expect(second.duplicate).toBe(true);
    expect(second.result).toEqual({ ok: true });
    expect(secondHandler).not.toHaveBeenCalled();

    service.onModuleDestroy();
  });

  it('libera el candado si la operación falla y permite reintentar', async () => {
    const service = new IdempotenciaService(createConfig());

    const failingHandler = jest.fn().mockRejectedValue(new Error('fallo'));
    await expect(service.execute('reserva-2', failingHandler)).rejects.toThrow(
      'fallo'
    );

    const recoveryHandler = jest.fn().mockResolvedValue({ ok: true });
    const recovery = await service.execute('reserva-2', recoveryHandler);
    expect(recovery.duplicate).toBe(false);
    expect(recovery.result).toEqual({ ok: true });
    expect(recoveryHandler).toHaveBeenCalledTimes(1);

    service.onModuleDestroy();
  });
});
