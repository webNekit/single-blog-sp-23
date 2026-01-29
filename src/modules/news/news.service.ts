import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NewsItemResponse, NewsListResponse, NewsQueryParams } from './types/index.type';
import { CreateNewsDto } from './dto/create-news.dto';
import { NEWS_DEFAULTS, NEWS_ERRORS } from './constants/index.constant';
import { getImagePublicUrl } from '../../common/utils/file-upload.util';
import { generateSlug } from '../../common/utils/slug.util';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(query: NewsQueryParams): Promise<{ news: NewsListResponse }> {
    const {
      isActive,
      page = NEWS_DEFAULTS.PAGE,
      limit = NEWS_DEFAULTS.LIMIT,
      categoryId,
      sortBy,
      order,
    } = query;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prismaService.news.findMany({
        where: {
          categoryId: categoryId ?? undefined,
          isActive: isActive ?? false,
        },
        skip: skip,
        take: Math.min(limit, NEWS_DEFAULTS.MAX_LIMIT),
        orderBy: {
          [sortBy || NEWS_DEFAULTS.SORT_BY]: order || NEWS_DEFAULTS.SORT_ORDER,
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          category: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prismaService.news.count({
        where: {
          categoryId: categoryId ?? undefined,
          isActive: isActive ?? false,
        },
      }),
    ]);

    return {
      news: {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateNewsDto, file: Express.Multer.File | undefined, authorId: string): Promise<{ news: NewsItemResponse }> {
    if (!file) {
      throw new BadRequestException(NEWS_ERRORS.IMAGE_REQUIRED_ON_CREATE);
    }

    const imageUrl = getImagePublicUrl(file.filename, this.configService);

    const categoryExists = dto.categoryId ? await this.prismaService.category.findUnique({
      where: { id: dto.categoryId },
    }) : null;

    if (dto.categoryId && !categoryExists) {
      throw new BadRequestException(NEWS_ERRORS.CATEGORY_NOT_FOUND);
    }

    const news = await this.prismaService.news.create({
      data: {
        title: dto.title,
        slug: generateSlug(dto.title),
        content: dto.content,
        imageUrl: imageUrl,
        isActive: dto.isActive ?? false,
        categoryId: dto.categoryId ?? null,
        userId: authorId,
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        category: { select: { id: true, title: true, slug: true } },
      },
    });
    return { news: news };
  }

  async update(id: string, dto: UpdateNewsDto, file: Express.Multer.File | undefined): Promise<{ updated: NewsItemResponse }> {
    const existing = await this.prismaService.news.findUnique({
      where: { id: id },
      include: { user: true },
    });

    if (!existing) {
      throw new NotFoundException(NEWS_ERRORS.NOT_FOUND);
    }

    let imageUrl = existing.imageUrl;
    if (file) {
      imageUrl = getImagePublicUrl(file.filename, this.configService);
    }

    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title) {
      slug = generateSlug(dto.title);
    }

    const data: Prisma.NewsUpdateInput = {
      title: dto.title,
      content: dto.content,
      isActive: dto.isActive,
      imageUrl: imageUrl,
      slug: slug,
    };

    if (dto.categoryId) {
      data.category = {
        connect: { id: dto.categoryId },
      };
    }

    const updated = await this.prismaService.news.update({
      where: { id: id },
      data: data,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        category: { select: { id: true, title: true, slug: true } },
      },
    });

    return { updated: updated };
  }
}
