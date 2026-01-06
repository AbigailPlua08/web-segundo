import { Tool, ToolDefinition } from './types';
import { BackendClient } from '../services/backend-client';

/**
 * Tool 3: Crear Reserva
 * Crea una nueva reserva para un tour específico
 */
export function createCrearReservaTool(backendClient: BackendClient): Tool {
  const definition: ToolDefinition = {
    name: 'crear_reserva',
    description: 'Crea una nueva reserva para un tour. Registra los datos del cliente y asigna los cupos. IMPORTANTE: Antes de usar esta herramienta, DEBES usar validar_disponibilidad para confirmar que hay cupos.',
    inputSchema: {
      type: 'object',
      properties: {
        tourId: {
          type: 'number',
          description: 'ID del tour a reservar',
        },
        nombreCliente: {
          type: 'string',
          description: 'Nombre completo del cliente',
        },
        emailCliente: {
          type: 'string',
          description: 'Email del cliente',
        },
        telefonoCliente: {
          type: 'string',
          description: 'Teléfono de contacto del cliente',
        },
        numeroPasajeros: {
          type: 'number',
          description: 'Cantidad de pasajeros para la reserva',
        },
      },
      required: ['tourId', 'nombreCliente', 'emailCliente', 'telefonoCliente', 'numeroPasajeros'],
    },
  };

  const execute = async (params: {
    tourId: number;
    nombreCliente: string;
    emailCliente: string;
    telefonoCliente: string;
    numeroPasajeros: number;
  }) => {
    try {
      const reserva = await backendClient.crearReserva(params);

      // Obtener información del tour
      const tour = await backendClient.obtenerTour(params.tourId);

      return {
        success: true,
        message: `✓ Reserva creada exitosamente`,
        data: {
          reservaId: reserva.id,
          estado: reserva.estado,
          tour: {
            id: tour.id,
            nombre: tour.nombre,
            destino: tour.destino,
            fechaSalida: tour.fechaSalida,
            fechaRetorno: tour.fechaRetorno,
          },
          cliente: {
            nombre: reserva.nombreCliente,
            email: reserva.emailCliente,
            telefono: reserva.telefonoCliente,
          },
          pasajeros: reserva.numeroPasajeros,
          montoTotal: reserva.montoTotal,
          creadoEn: reserva.creadoEn,
          siguientesPasos: [
            'La reserva está en estado PENDIENTE',
            'Para confirmarla, use el endpoint POST /reservas/{id}/confirmar',
            'Se enviará confirmación al email registrado',
          ],
        },
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      
      return {
        success: false,
        message: `✗ Error al crear la reserva: ${errorMessage}`,
        error: errorMessage,
        sugerencia: errorMessage.includes('cupos')
          ? 'Verifique la disponibilidad usando validar_disponibilidad antes de intentar nuevamente'
          : 'Revise los datos proporcionados y vuelva a intentar',
      };
    }
  };

  return { definition, execute };
}
