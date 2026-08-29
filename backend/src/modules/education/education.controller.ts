import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EducationService } from './education.service';
import { EducationQueryDto } from './dto/education-query.dto';

@ApiTags('education')
@ApiBearerAuth()
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  list(@Query() query: EducationQueryDto) {
    return this.educationService.list(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.educationService.getBySlug(slug);
  }
}
