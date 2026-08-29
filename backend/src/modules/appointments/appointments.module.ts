import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';
import { MothersModule } from '../mothers/mothers.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [MothersModule, RabbitMQModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
