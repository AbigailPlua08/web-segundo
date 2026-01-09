import { Tool, ToolDefinition } from './types';
import { BackendClient } from '../services/backend-client';

/**
 * Tool 1: Búsqueda de Tours
 * Permite buscar tours por nombre o destino
 */
export function createBuscarTourTool(backendClient: BackendClient): Tool {
  const definition: ToolDefinition = {
    name: 'buscar_tour',
    description: 'Busca tours disponibles por nombre o destino. Útil cuando el usuario quiere explorar opciones de viaje o necesita información sobre tours específicos.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Término de búsqueda (nombre del tour o destino)',
        },
      },
      required: ['query'],
    },
  };

  const execute = async (params: { query: string }) => {
    try {
      const tours = await backendClient.buscarTours(params.query);
      
      if (tours.length === 0) {
        return {
          success: false,
          message: `No se encontraron tours con el término "${params.query}"`,
          data: [],
        };
      }

      return {
        success: true,
        message: `Se encontraron ${tours.length} tour(s)`,
        data: tours.map((tour: any) => ({
          id: tour.id,
          nombre: tour.nombre,
          destino: tour.destino,
          precio: tour.precio,
          cuposDisponibles: tour.cuposDisponibles,
          fechaSalida: tour.fechaSalida,
          fechaRetorno: tour.fechaRetorno,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error al buscar tours: ${error.message}`,
        data: [],
      };
    }
  };

  return { definition, execute };
}
