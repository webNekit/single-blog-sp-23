import {
  Body,
  Controller, Delete, Get,
  Param,
  Patch,
  Post, Query,
  UploadedFile, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateNewsDto } from './dto/create-news.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerImageOptions } from '../../common/utils/file-upload.util';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppRole } from '../../common/types/shared.type';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Roles(AppRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateNewsDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') authorId: string,
  ) {
    return this.newsService.create(dto, file, authorId);
  }

  @Patch(':id')
  @Roles(AppRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('image', multerImageOptions(new ConfigService())),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.newsService.update(id, dto, file);
  }

  @Delete(':id')
  @Roles(AppRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.newsService.findAll({
      categoryId: query.categoryId,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : true,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy,
      order: query.order,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.newsService.findOne(slug);
  }
}
