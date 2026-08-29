import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { MothersService } from './mothers.service';
import { UpdateMotherProfileDto } from './dto/update-mother-profile.dto';

@ApiTags('mothers')
@ApiBearerAuth()
@Roles(Role.MOTHER)
@Controller('mothers/me')
export class MothersController {
  constructor(private readonly mothersService: MothersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.mothersService.getMyProfile(user.sub);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateMotherProfileDto) {
    return this.mothersService.updateMyProfile(user.sub, dto);
  }
}
