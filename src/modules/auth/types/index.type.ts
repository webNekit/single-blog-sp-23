import { AppRole } from '../../../common/types/shared.type';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: AppRole;
};