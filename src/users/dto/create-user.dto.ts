import { IsMobilePhone, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsMobilePhone(['fa-IR', 'en-US'] as any)
  phone: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}
