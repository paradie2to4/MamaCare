import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EducationCategory } from '@prisma/client';

export class EducationQueryDto {
  @ApiProperty({ required: false, enum: EducationCategory })
  @IsOptional()
  @IsEnum(EducationCategory)
  category?: EducationCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pregnancyStage?: string;
}
