import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email' })
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  @MaxLength(12, { message: 'Максимальная длина пароля 12 символов' })
  password?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Роль должна быть одной из следующих: USER или ADMIN' })
  role?: Role;
}