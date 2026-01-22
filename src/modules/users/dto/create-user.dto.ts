import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Минимальная длина пароля 6 символов' })
  @MaxLength(12, { message: 'Максимальная длина пароля 12 символов' })
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(Role, { message: 'Роль должна быть одной из следующих: USER или ADMIN' })
  role: Role;
}