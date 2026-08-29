import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class InvitePartnerDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
