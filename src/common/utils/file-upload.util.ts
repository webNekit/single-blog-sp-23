import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';

export const multerImageOptions = (
  configService: ConfigService,
): MulterOptions => {
  const uploadDir = configService.get<string>('UPLOAD_DIR') || 'uploads';
  const maxSize =
    configService.get<number>('UPLOAD_MAX_SIZE') || 10 * 1024 * 1024; // 10MB default
  const allowedMimes = configService
    .get<string>('UPLOAD_ALLOWED_MIME_TYPES')
    ?.split(',') || ['image/jpeg', 'image/png', 'image/webp'];

  return {
    limits: {
      fileSize: maxSize,
    },

    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!allowedMimes.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `Invalid file type. Allowed: ${allowedMimes.join(', ')}`,
          ),
          false,
        );
      }
      callback(null, true);
    },

    // Хранение на диск с уникальным именем
    storage: diskStorage({
      destination: `./${uploadDir}`,

      filename: (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
        callback(null, uniqueName);
      },
    }),
  };
};

// Вспомогательная функция для генерации публичного URL
export const getImagePublicUrl = (
  filename: string,
  configService: ConfigService,
): string => {
  const baseUrl =
    configService.get<string>('BASE_URL') || 'http://localhost:9000'; // можно добавить в .env позже
  return `${baseUrl}/uploads/${filename}`;
};
