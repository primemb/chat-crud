import { IsMobilePhone, IsString } from 'class-validator';

export class SignInDto {
  @IsMobilePhone(['fa-IR', 'en-US'] as any)
  phone: string;

  @IsString()
  password: string;
}
