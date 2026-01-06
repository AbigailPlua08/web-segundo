import { Logger } from '@nestjs/common';

/**
 * Logger centralizado para compartir formato entre microservicios.
 */
export class AppLogger extends Logger {
  constructor(context: string) {
    super(context, { timestamp: true });
  }

  child(childContext: string) {
    return new AppLogger(`${this.context}:${childContext}`);
  }
}
