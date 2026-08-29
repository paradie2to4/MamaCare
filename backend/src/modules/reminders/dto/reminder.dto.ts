import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ReminderChannel, ReminderStatus, ReminderType } from '@prisma/client';

export class CreateReminderDto {
  @ApiProperty({ enum: ReminderType })
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  message: string;

  @ApiProperty()
  @IsDateString()
  scheduledFor: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({ required: false, enum: ReminderChannel })
  @IsOptional()
  @IsEnum(ReminderChannel)
  channel?: ReminderChannel;
}

export class ReminderQueryDto {
  @ApiProperty({ required: false, enum: ReminderStatus })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;
}
