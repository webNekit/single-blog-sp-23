import { Request } from 'express';

export enum AppRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: AppRole;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: AppRole;
  iat?: number;
  exp?: number;
}

export type RefreshToken = string;