import { Module } from '@nestjs/common';
import { ChwModule } from '../chw/chw.module';
import { MothersModule } from '../mothers/mothers.module';
import { FollowUpsController } from './follow-ups.controller';
import { FollowUpsService } from './follow-ups.service';

@Module({
  imports: [ChwModule, MothersModule],
  controllers: [FollowUpsController],
  providers: [FollowUpsService],
  exports: [FollowUpsService],
})
export class FollowUpsModule {}
