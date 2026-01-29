import {
  Body,
  Controller, Get,
  Param,
  Patch,
  Post, Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateNewsDto } from './dto/create-news.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerImageOptions } from '../../common/utils/file-upload.util';
import { UpdateNewsDto } from './dto/update-news.dto';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateNewsDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') authorId: string,
  ) {
    return this.newsService.create(dto, file, authorId);
  }

  @Patch(':id')
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
}
