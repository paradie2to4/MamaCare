import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { PartnersService } from './partners.service';
import { InvitePartnerDto } from './dto/invite-partner.dto';

@ApiTags('partners')
@ApiBearerAuth()
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Roles(Role.MOTHER)
  @Post('invite')
  invite(@CurrentUser() user: JwtPayload, @Body() dto: InvitePartnerDto) {
    return this.partnersService.invite(user.sub, dto.email);
  }

  @Roles(Role.MOTHER)
  @Get('my-link')
  getMyLink(@CurrentUser() user: JwtPayload) {
    return this.partnersService.getMyLinkAsMother(user.sub);
  }

  @Roles(Role.MOTHER)
  @Patch('revoke')
  revoke(@CurrentUser() user: JwtPayload) {
    return this.partnersService.revokeAsMother(user.sub);
  }

  @Roles(Role.PARTNER)
  @Get('dashboard')
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.partnersService.getDashboardAsPartner(user.sub);
  }

  @Roles(Role.PARTNER)
  @Patch('accept')
  accept(@CurrentUser() user: JwtPayload) {
    return this.partnersService.acceptAsPartner(user.sub);
  }
}
