import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from '@prisma/client';

export class NotificationQueryDto {
  @ApiProperty({ required: false, enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  unreadOnly?: boolean;
}
