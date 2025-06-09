import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { RoleGuard } from '../auth/role.guard'; // ✅ correspond à la classe exportée
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Public
  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }

  // Admin uniquement
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  create(@Body() body: any) {
    return this.newsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.newsService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  remove(@Param('id') id: string) {
    return this.newsService.remove(+id);
  }
}
