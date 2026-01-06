import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
} from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { CrearReservaDto } from '@arquitectura/shared';
import { ReservaService } from './reserva.service';
import { ReservaRepository } from './reserva.repository';

function createConfig(): ConfigService {
  return {
    get: jest.fn((_: string, defaultValue?: unknown) => defaultValue),
  } as unknown as ConfigService;
}

describe('ReservaService', () => {
  let repository: jest.Mocked<
    Pick<
      ReservaRepository,
      'createReserva' | 'actualizarEstado' | 'findAll' | 'findByIdempotency'
    >
  >;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      createReserva: jest.fn(),
      actualizarEstado: jest.fn(),
      findByIdempotency: jest.fn(),
    } as unknown as jest.Mocked<
      Pick<
        ReservaRepository,
        'createReserva' | 'actualizarEstado' | 'findAll' | 'findByIdempotency'
      >
    >;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('confirma la reserva cuando la actualización del tour es exitosa', async () => {
    const clientMock: Partial<ClientProxy> = {
      send: jest
        .fn()
        .mockReturnValue(of({ id: 'tour-1', capacidadDisponible: 18 })),
      close: jest.fn(),
    };

    const reservaPendiente = {
      id: 'reserva-1',
      estado: 'pendiente',
      tourId: 'tour-1',
      usuarioId: 'usuario-9',
    } as any;
    const reservaConfirmada = { ...reservaPendiente, estado: 'confirmada' };

    repository.findByIdempotency.mockResolvedValueOnce(null);
    repository.createReserva.mockResolvedValue(reservaPendiente);
    repository.actualizarEstado.mockResolvedValue(reservaConfirmada);

    jest
      .spyOn(ClientProxyFactory, 'create')
      .mockReturnValue(clientMock as ClientProxy);

    const service = new ReservaService(
      repository as unknown as ReservaRepository,
      createConfig()
    );

    const dto: CrearReservaDto = {
      tourId: 'tour-1',
      usuarioId: 'usuario-9',
      fechaReserva: '2025-12-20T12:00:00.000Z',
      cantidadPersonas: 2,
      idempotencyKey: 'idempo-1',
    };

    const result = await service.crear(dto);
    expect(repository.createReserva).toHaveBeenCalledWith(
      expect.objectContaining({
        tourId: dto.tourId,
        usuarioId: dto.usuarioId,
        estado: 'pendiente',
      })
    );
    expect(clientMock.send).toHaveBeenCalledWith('tour.actualizar', {
      tourId: dto.tourId,
      deltaCapacidad: -dto.cantidadPersonas,
    });
    expect(repository.actualizarEstado).toHaveBeenLastCalledWith(
      reservaPendiente.id,
      'confirmada'
    );
    expect(result).toEqual({
      reserva: reservaConfirmada,
      disponibilidad: { id: 'tour-1', capacidadDisponible: 18 },
    });

    service.onModuleDestroy();
    expect(clientMock.close).toHaveBeenCalled();
  });

  it('cancela la reserva cuando la actualización del tour falla', async () => {
    const clientMock: Partial<ClientProxy> = {
      send: jest.fn().mockReturnValue(throwError(() => new Error('sin cupos'))),
      close: jest.fn(),
    };

    const reservaPendiente = {
      id: 'reserva-2',
      estado: 'pendiente',
      tourId: 'tour-2',
      usuarioId: 'usuario-18',
    } as any;

    repository.findByIdempotency.mockResolvedValueOnce(null);
    repository.createReserva.mockResolvedValue(reservaPendiente);
    repository.actualizarEstado.mockResolvedValue({
      ...reservaPendiente,
      estado: 'cancelada',
    });

    jest
      .spyOn(ClientProxyFactory, 'create')
      .mockReturnValue(clientMock as ClientProxy);

    const service = new ReservaService(
      repository as unknown as ReservaRepository,
      createConfig()
    );

    const dto: CrearReservaDto = {
      tourId: 'tour-2',
      usuarioId: 'usuario-18',
      fechaReserva: '2025-12-20T12:00:00.000Z',
      cantidadPersonas: 4,
      idempotencyKey: 'idempo-2',
    };

    await expect(service.crear(dto)).rejects.toBeInstanceOf(RpcException);
    expect(repository.actualizarEstado).toHaveBeenCalledWith(
      reservaPendiente.id,
      'cancelada'
    );

    service.onModuleDestroy();
    expect(clientMock.close).toHaveBeenCalled();
  });

  it('reutiliza una reserva existente cuando la clave idempotente ya existe', async () => {
    const existente = {
      id: 'reserva-3',
      estado: 'confirmada',
      tourId: 'tour-3',
      usuarioId: 'usuario-33',
    } as any;

    repository.findByIdempotency.mockResolvedValue(existente);

    const clientMock: Partial<ClientProxy> = {
      send: jest.fn(),
      close: jest.fn(),
    };

    jest
      .spyOn(ClientProxyFactory, 'create')
      .mockReturnValue(clientMock as ClientProxy);

    const service = new ReservaService(
      repository as unknown as ReservaRepository,
      createConfig()
    );

    const dto: CrearReservaDto = {
      tourId: 'tour-3',
      usuarioId: 'usuario-33',
      fechaReserva: undefined as unknown as string,
      cantidadPersonas: 1,
      idempotencyKey: 'idempo-3',
    };

    const result = await service.crear(dto);
    expect(repository.createReserva).not.toHaveBeenCalled();
    expect(repository.actualizarEstado).not.toHaveBeenCalled();
    expect(result).toEqual({ reserva: existente, disponibilidad: null });

    service.onModuleDestroy();
    expect(clientMock.close).toHaveBeenCalled();
  });
});
