import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Задан некорректный email адрес!' })
  email: string;
  @IsString({ message: 'Поле пароль должен быть строкой' })
  @MinLength(6, { message: 'Минимальное кол-во символов должно быть равно 6' })
  @MaxLength(12, { message: 'Максимальное кол-во символов должно быть равно 12' })
  password: string;
}