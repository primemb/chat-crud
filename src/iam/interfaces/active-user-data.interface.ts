import { Role } from '@prisma/client';

export interface ActiveUserData {
  sub: string;

  email: string;

  phone: string;

  fullName: string;

  role: Role;
}
