import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto, FollowUpQueryDto, UpdateFollowUpDto } from './dto/follow-up.dto';

@ApiTags('follow-ups')
@ApiBearerAuth()
@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Roles(Role.CHW)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateFollowUpDto) {
    return this.followUpsService.createForMother(user.sub, dto);
  }

  @Roles(Role.CHW)
  @Get('mine')
  listMine(@CurrentUser() user: JwtPayload, @Query() query: FollowUpQueryDto) {
    return this.followUpsService.listMine(user.sub, query.status);
  }

  @Roles(Role.CHW)
  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateFollowUpDto) {
    return this.followUpsService.update(user.sub, id, dto);
  }

  @Roles(Role.CHW)
  @Patch(':id/complete')
  complete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.followUpsService.complete(user.sub, id);
  }

  @Roles(Role.MOTHER)
  @Get('my')
  listMy(@CurrentUser() user: JwtPayload) {
    return this.followUpsService.listForUser(user.sub, user.role);
  }
}
