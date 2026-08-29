import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ChwService } from './chw.service';

@ApiTags('chw')
@ApiBearerAuth()
@Roles(Role.CHW)
@Controller('chw')
export class ChwController {
  constructor(private readonly chwService: ChwService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.chwService.getSummary(user.sub);
  }

  @Get('mothers')
  listMothers(@CurrentUser() user: JwtPayload) {
    return this.chwService.listAssignedMothers(user.sub);
  }

  @Get('mothers/:motherProfileId')
  getMother(@CurrentUser() user: JwtPayload, @Param('motherProfileId') motherProfileId: string) {
    return this.chwService.getMotherDetail(user.sub, motherProfileId);
  }
}
