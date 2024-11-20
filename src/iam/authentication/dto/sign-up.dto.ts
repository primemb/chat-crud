import { IsEmail, IsMobilePhone, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  fullName: string;

  @IsMobilePhone(['fa-IR', 'en-US'] as any)
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  email: string;
}
