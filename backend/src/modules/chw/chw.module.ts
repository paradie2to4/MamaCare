import { Module } from '@nestjs/common';
import { ChwController } from './chw.controller';
import { ChwService } from './chw.service';

@Module({
  controllers: [ChwController],
  providers: [ChwService],
  exports: [ChwService],
})
export class ChwModule {}
