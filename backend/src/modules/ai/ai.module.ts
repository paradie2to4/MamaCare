import { Module } from '@nestjs/common';
import { MothersModule } from '../mothers/mothers.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [MothersModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
