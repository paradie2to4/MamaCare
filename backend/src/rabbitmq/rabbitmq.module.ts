import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { DomainEventsConsumer } from './consumers/domain-events.consumer';
import { EventsPublisherService } from './events-publisher.service';
import { EVENTS_CLIENT, EVENTS_QUEUE } from './rabbitmq.constants';

@Module({
  imports: [
    NotificationsModule,
    ClientsModule.registerAsync([
      {
        name: EVENTS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: EVENTS_QUEUE,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [DomainEventsConsumer],
  providers: [EventsPublisherService],
  exports: [EventsPublisherService],
})
export class RabbitMQModule {}
