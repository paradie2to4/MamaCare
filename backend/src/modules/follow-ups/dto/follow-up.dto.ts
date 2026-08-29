import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { FollowUpPriority, FollowUpStatus } from '@prisma/client';

export class CreateFollowUpDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  motherProfileId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  reason: string;

  @ApiProperty({ enum: FollowUpPriority })
  @IsEnum(FollowUpPriority)
  priority: FollowUpPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateFollowUpDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false, enum: FollowUpPriority })
  @IsOptional()
  @IsEnum(FollowUpPriority)
  priority?: FollowUpPriority;

  @ApiProperty({ required: false, enum: FollowUpStatus })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class FollowUpQueryDto {
  @ApiProperty({ required: false, enum: FollowUpStatus })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
