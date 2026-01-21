import { Role } from '@prisma/client';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};