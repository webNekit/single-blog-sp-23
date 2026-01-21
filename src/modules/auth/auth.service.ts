import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, TokenPair } from './types/index.type';
import { AppRole } from '../../common/types/shared.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  private async generateToken(userId: string, email: string, role: AppRole): Promise<TokenPair> {
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
