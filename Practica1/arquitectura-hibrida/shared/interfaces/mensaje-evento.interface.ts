export interface MensajeEvento<TPayload = unknown> {
  id: string;
  tipo: string;
  fecha: string;
  payload: TPayload;
}
