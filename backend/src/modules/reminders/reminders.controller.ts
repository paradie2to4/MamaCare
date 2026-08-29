import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, ReminderQueryDto } from './dto/reminder.dto';

@ApiTags('reminders')
@ApiBearerAuth()
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: ReminderQueryDto) {
    return this.remindersService.list(user.sub, query.status);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(user.sub, dto);
  }

  @Patch(':id/dismiss')
  dismiss(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.dismiss(user.sub, id);
  }
}
