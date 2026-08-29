import { Module } from '@nestjs/common';
import { MothersController } from './mothers.controller';
import { MothersService } from './mothers.service';
import { PregnanciesController } from './pregnancies.controller';
import { PregnanciesService } from './pregnancies.service';

@Module({
  controllers: [MothersController, PregnanciesController],
  providers: [MothersService, PregnanciesService],
  exports: [MothersService, PregnanciesService],
})
export class MothersModule {}
