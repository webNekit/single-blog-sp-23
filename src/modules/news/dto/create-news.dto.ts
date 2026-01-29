import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @MinLength(4, { message: 'Минимальное кол-во символов 4' })
  @MaxLength(200, { message: 'Максимальное кол-во символов 200' })
  title: string;

  @IsString()
  @MinLength(20, { message: 'Минимальное кол-во символов 20' })
  content: string;

  @IsOptional()
  isActive?: boolean;

  @IsUUID(4, { message: 'Не правильный формат id' })
  categoryId: string;
}
