import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitService {
  constructor(private readonly config: ConfigService) {}

  createMicroserviceOptions(): RmqOptions {
    const url = this.config.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672'
    );
    const queue = this.config.get<string>(
      'RABBITMQ_QUEUE',
      'reserva.command.queue'
    );

    return {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue,
        noAck: false,
        queueOptions: {
          durable: true,
        },
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
