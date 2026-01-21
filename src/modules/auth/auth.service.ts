import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, TokenPair } from './types/index.type';
import { RequestWithUser } from '../../common/types/shared.type';
import { Response } from 'express';
import { AuthResponseConstant } from './constants/auth-response.constant';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(dto: RegisterDto, res: Response): Promise<AuthResponseConstant> {
    const existing = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует!');
    }

    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        password: await argon2.hash(dto.password),
        role: Role.USER,
      },
    });

    const generatedToken = await this.generateToken(user.id, user.email, user.role);
    await this.updateRefreshTokenInDB(user.id, generatedToken.refreshToken);
    this.setTokenCookies(res, generatedToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto, res: Response): Promise<AuthResponseConstant> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await argon2.verify(user.password, dto.password))) {
      throw new UnauthorizedException('Неверный логин и/или пароль');
    }

    const token = await this.generateToken(user.id, user.email, user.role);
    await this.updateRefreshTokenInDB(user.id, token.refreshToken);
    this.setTokenCookies(res, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async logout(user: RequestWithUser['user'], res: Response): Promise<{ message: string }> {
    await this.updateRefreshTokenInDB(user.userId, null);
    this.clearTokenCookies(res);

    return { message: 'Вы успешно вышли из системы!' };
  }

  async refresh(request: RequestWithUser, res: Response): Promise<AuthResponseConstant> {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh-токен не найден!');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Не валидный refresh-токен');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Такого пользователя не существует!');
    }

    const isValid = await argon2.verify(user.refreshToken, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Неверный refresh-токен');
    }

    const token = await this.generateToken(user.id, user.email, user.role);
    await this.updateRefreshTokenInDB(user.id, token.refreshToken);
    this.setTokenCookies(res, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  private async updateRefreshTokenInDB(userId: string, refreshToken: string | null) {
    const hashToken = refreshToken ? await argon2.hash(refreshToken) : null;
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hashToken },
    });
  }

  private async generateToken(userId: string, email: string, role: Role): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email: email, role: role };
    const [accessToken, refreshToken] = await Promise.all([
      // access
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN') as any,
      }),
      // refresh
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN') as any,
      }),
    ]);

    return { accessToken, refreshToken };

  }

  private setTokenCookies(res: Response, pair: TokenPair) {
    const isSecure = this.configService.get<boolean>('COOKIE_SECURE') ?? false;
    const sameSite = this.configService.get<'lax' | 'strict' | 'none'>('COOKIE_SAMESITE') ?? 'lax';

    res.cookie('access_token', pair.accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSite,
      path: '/',
      maxAge: this.parseDuration(this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m')
    });

    res.cookie('refresh_token', pair.refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSite,
      path: '/api/auth/refresh',
      maxAge: this.parseDuration(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d')
    });
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([mhd])$/);
    if (!match) return 60_000;
    const value = parseInt(match[1], 10);
    switch (match[2]) {
      case 'm':
        return value * 60_000;
      case 'h':
        return value * 3_600_000;
      case 'd':
        return value * 86_400_000;
      default:
        return value * 60_000;
    }
  }
}
