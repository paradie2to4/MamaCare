import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module';
import { MothersModule } from '../mothers/mothers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  imports: [MothersModule, AppointmentsModule, NotificationsModule],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
