import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createNestApp } from './create-app';
import { EVENTS_QUEUE } from './rabbitmq/rabbitmq.constants';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await createNestApp();

  // Only attach the RabbitMQ consumer when a broker URL is configured, and never
  // await/block HTTP bootstrap on it — a broker outage must never prevent the
  // API itself from starting. This hybrid-app pattern only applies to this
  // traditional long-running server entrypoint, not the Vercel serverless one
  // (api/index.ts), which can't host a persistent AMQP consumer anyway.
  if (process.env.RABBITMQ_URL) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: EVENTS_QUEUE,
        queueOptions: { durable: true },
        noAck: true,
      },
    });
    app
      .startAllMicroservices()
      .then(() => logger.log('RabbitMQ event consumer connected.'))
      .catch((error) => logger.warn(`RabbitMQ consumer unavailable: ${error?.message}`));
  } else {
    logger.warn(
      'RABBITMQ_URL not set — event consumer disabled (publisher calls still no-op safely).',
    );
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
