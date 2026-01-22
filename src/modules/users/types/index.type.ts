import { Role } from '@prisma/client';

export class UserResponseType {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: Date;
}