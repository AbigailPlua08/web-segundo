import axios, { AxiosInstance } from 'axios';

/**
 * Cliente HTTP para comunicarse con el Backend REST
 */
export class BackendClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ==================== TOURS ====================
  
  async buscarTours(query: string) {
    const response = await this.client.get(`/tours/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async obtenerTour(id: number) {
    const response = await this.client.get(`/tours/${id}`);
    return response.data;
  }

  async listarTours() {
    const response = await this.client.get('/tours');
    return response.data;
  }

  async verificarDisponibilidad(tourId: number, cantidad: number) {
    const response = await this.client.get(
      `/tours/${tourId}/disponibilidad?cantidad=${cantidad}`
    );
    return response.data;
  }

  // ==================== RESERVAS ====================

  async crearReserva(data: {
    tourId: number;
    nombreCliente: string;
    emailCliente: string;
    telefonoCliente: string;
    numeroPasajeros: number;
  }) {
    const response = await this.client.post('/reservas', data);
    return response.data;
  }

  async obtenerReserva(id: number) {
    const response = await this.client.get(`/reservas/${id}`);
    return response.data;
  }

  async confirmarReserva(id: number) {
    const response = await this.client.post(`/reservas/${id}/confirmar`);
    return response.data;
  }

  async cancelarReserva(id: number) {
    const response = await this.client.post(`/reservas/${id}/cancelar`);
    return response.data;
  }

  async listarReservasPorCliente(email: string) {
    const response = await this.client.get(`/reservas?email=${encodeURIComponent(email)}`);
    return response.data;
  }
}
