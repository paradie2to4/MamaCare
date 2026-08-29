import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ enum: AppointmentType })
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiProperty()
  @IsDateString()
  scheduledAt: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  facilityName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pregnancyId?: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ required: false, enum: AppointmentType })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facilityName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}

export class AppointmentQueryDto {
  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
