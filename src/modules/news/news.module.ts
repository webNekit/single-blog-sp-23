import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerImageOptions } from '../../common/utils/file-upload.util';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService)=> {
        return multerImageOptions(configService);
      },
    }),
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
