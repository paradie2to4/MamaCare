import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { PregnanciesService } from './pregnancies.service';
import { CreatePregnancyDto, UpdatePregnancyDto } from './dto/pregnancy.dto';

@ApiTags('pregnancies')
@ApiBearerAuth()
@Roles(Role.MOTHER)
@Controller('mothers/me/pregnancies')
export class PregnanciesController {
  constructor(private readonly pregnanciesService: PregnanciesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.pregnanciesService.listForUser(user.sub);
  }

  @Get('current')
  getCurrent(@CurrentUser() user: JwtPayload) {
    return this.pregnanciesService.getCurrentForUser(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePregnancyDto) {
    return this.pregnanciesService.createForUser(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePregnancyDto,
  ) {
    return this.pregnanciesService.updateForUser(user.sub, id, dto);
  }
}
