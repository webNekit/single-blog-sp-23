import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NewsCategoriesResponse, NewsCategoryItemResponse } from './types/index.type';
import { generateSlug } from '../../common/utils/slug.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

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

  async create(dto: CreateCategoryDto): Promise<{ category: NewsCategoryItemResponse }> {
    let slug = dto.slug || generateSlug(dto.title);

    try {
      const category = await this.prismaService.category.create({
        data: {
          title: dto.title,
          slug: slug,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          news: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return { category: category };
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ConflictException('Категория с таким slug уже существует!');
          }
        }
        throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<{ category: NewsCategoryItemResponse }> {
    const existing = await this.prismaService.category.findUnique({
      where: { id: id },
      select: { id: true, title: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundException(`Категория с id ${id} не найдена!`);
    }

    const data: Partial<Prisma.CategoryUpdateInput> = {};

    if (dto.title) data.title = dto.title;
    if (dto.slug) {
      data.slug = dto.slug;
    } else if (dto.title !== undefined) {
      data.slug = generateSlug(dto.title);
    }

    const category = await this.prismaService.category.update({
      where: { id: existing.id },
      data: data,
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
      },
    });

    return { category: category };
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.prismaService.category.findUnique({ where: { id: id } });

    if (!existing) {
      throw new NotFoundException(`Категория с id ${id} не найдена`);
    }

    await this.prismaService.category.delete({
      where: { id: existing.id },
    });

    return { message: 'Категория успешно удалена!' };
  }
}
