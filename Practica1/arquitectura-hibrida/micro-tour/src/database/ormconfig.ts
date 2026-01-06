import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const buildOrmConfig = (
  config: ConfigService
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: Number(config.get<number>('DB_PORT', 5433)),
  database: config.get<string>('DB_NAME', 'tours'),
  username: config.get<string>('DB_USER', 'tour_admin'),
  password: config.get<string>('DB_PASSWORD', 'secret'),
  autoLoadEntities: true,
  synchronize: true,
  logging: config.get<string>('NODE_ENV') === 'development',
});
