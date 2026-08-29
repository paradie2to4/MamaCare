import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { PregnancyStatus } from '@prisma/client';

export class CreatePregnancyDto {
  @ApiProperty()
  @IsDateString()
  lmpDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  eddDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePregnancyDto {
  @ApiProperty({ required: false, enum: PregnancyStatus })
  @IsOptional()
  @IsIn(Object.values(PregnancyStatus))
  status?: PregnancyStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  eddDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
