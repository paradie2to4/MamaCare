import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { EVENTS_QUEUE } from './rabbitmq/rabbitmq.constants';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformResponseInterceptor());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MamaCare Rwanda API')
    .setDescription('Maternal & newborn health platform — Phase 1 API surface')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Only attach the RabbitMQ consumer when a broker URL is configured, and never
  // await/block HTTP bootstrap on it — a broker outage must never prevent the
  // API itself from starting (there is no broker in this dev session).
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
