import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NewsCategoriesResponse } from './types/index.type';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<{ categories: NewsCategoriesResponse[] }> {
    const categories = await this.prismaService.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        news: {
          select: { id: true, title: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return { categories: categories };
  }

  async findOne(id: string): Promise<{ category: NewsCategoriesResponse }> {
    const category = await this.prismaService.category.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        news: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return { category: category };
  }

  // async create(dto: CreateCategoryDto): Promise<{ categories: NewsCategoriesResponse }> {}

  // async update(id: string, dto: UpdateCategoryDto): Promise<{ categories: NewsCategoriesResponse }> {}

  // async remove(id: string): Promise<{ categories: NewsCategoriesResponse }> {}
}
