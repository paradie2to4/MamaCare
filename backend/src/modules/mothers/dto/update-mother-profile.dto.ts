import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMotherProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cell?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}
