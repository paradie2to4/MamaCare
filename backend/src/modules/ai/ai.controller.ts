import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AiService } from './ai.service';
import { SendMessageDto } from './dto/ai.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Roles(Role.MOTHER)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('messages')
  getHistory(@CurrentUser() user: JwtPayload) {
    return this.aiService.getHistory(user.sub);
  }

  @Post('messages')
  sendMessage(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    return this.aiService.sendMessage(user.sub, dto.content);
  }
}
