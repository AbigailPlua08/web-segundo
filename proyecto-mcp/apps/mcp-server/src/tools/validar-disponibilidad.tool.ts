import { Tool, ToolDefinition } from './types';
import { BackendClient } from '../services/backend-client';

/**
 * Tool 2: Validación de Disponibilidad
 * Verifica si un tour tiene cupos disponibles para la cantidad solicitada
 */
export function createValidarDisponibilidadTool(backendClient: BackendClient): Tool {
  const definition: ToolDefinition = {
    name: 'validar_disponibilidad',
    description: 'Valida si un tour tiene cupos disponibles para la cantidad de pasajeros solicitada. Debe usarse ANTES de crear una reserva para asegurar que hay espacio.',
    inputSchema: {
      type: 'object',
      properties: {
        tourId: {
          type: 'number',
          description: 'ID del tour a validar',
        },
        numeroPasajeros: {
          type: 'number',
          description: 'Cantidad de pasajeros que desean reservar',
        },
      },
      required: ['tourId', 'numeroPasajeros'],
    },
  };

  const execute = async (params: { tourId: number; numeroPasajeros: number }) => {
    try {
      // Primero obtener el tour para mostrar información
      const tour = await backendClient.obtenerTour(params.tourId);
      
      // Luego verificar disponibilidad
      const { disponible } = await backendClient.verificarDisponibilidad(
        params.tourId,
        params.numeroPasajeros
      );

      if (disponible) {
        return {
          success: true,
          disponible: true,
          message: `✓ El tour "${tour.nombre}" tiene ${tour.cuposDisponibles} cupos disponibles. Puede reservar para ${params.numeroPasajeros} pasajero(s).`,
          data: {
            tourId: tour.id,
            nombreTour: tour.nombre,
            destino: tour.destino,
            precio: tour.precio,
            cuposDisponibles: tour.cuposDisponibles,
            cuposSolicitados: params.numeroPasajeros,
            montoEstimado: tour.precio * params.numeroPasajeros,
          },
        };
      } else {
        return {
          success: false,
          disponible: false,
          message: `✗ El tour "${tour.nombre}" no tiene suficientes cupos. Disponibles: ${tour.cuposDisponibles}, Solicitados: ${params.numeroPasajeros}`,
          data: {
            tourId: tour.id,
            nombreTour: tour.nombre,
            cuposDisponibles: tour.cuposDisponibles,
            cuposSolicitados: params.numeroPasajeros,
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        disponible: false,
        message: `Error al validar disponibilidad: ${error.response?.data?.message || error.message}`,
      };
    }
  };

  return { definition, execute };
}
