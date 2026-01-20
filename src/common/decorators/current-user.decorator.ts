import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../types/shared.type';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestWithUser['user'] | undefined, ctx: ExecutionContext)=> {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      return null;
    }

    return data ? request.user[data] : request.user;
  },
);