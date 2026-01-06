import { Module } from '@nestjs/common';
import { IdempotenciaService } from './idempotencia.service';

@Module({
  providers: [IdempotenciaService],
  exports: [IdempotenciaService],
})
export class IdempotenciaModule {}
