import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AppointmentsService } from './appointments.service';
import {
  AppointmentQueryDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/appointment.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@Roles(Role.MOTHER)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: AppointmentQueryDto) {
    return this.appointmentsService.list(user.sub, user.role, query.status);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.appointmentsService.getOne(user.sub, user.role, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.sub, user.role, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(user.sub, user.role, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(user.sub, user.role, id, dto.status);
  }
}
