import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MothersModule } from './modules/mothers/mothers.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { EducationModule } from './modules/education/education.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChwModule } from './modules/chw/chw.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { PartnersModule } from './modules/partners/partners.module';
import { AiModule } from './modules/ai/ai.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MothersModule,
    AppointmentsModule,
    RemindersModule,
    EducationModule,
    NotificationsModule,
    ChwModule,
    FollowUpsModule,
    PartnersModule,
    AiModule,
    RabbitMQModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
