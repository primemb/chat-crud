import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from 'src/users/users.service';
import { HashingService } from '../hashing/hashing.service';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const userExists = await this.usersService.findByEmailOrPhone(
      signUpDto.email,
      signUpDto.phone,
    );

    if (userExists) {
      throw new BadRequestException('Email or phone already exists');
    }

    const hashedPassword = await this.hashingService.hash(signUpDto.password);

    const user = await this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return { accessToken, refreshToken, role: user.role };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findByPhone(signInDto.phone);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    const accessTokenExpiresAt = moment()
      .add(this.jwtConfiguration.accessTokenTtl, 'seconds')
      .format('X');

    const refreshTokenExpiresAt = moment()
      .add(this.jwtConfiguration.refreshTokenTtl, 'seconds')
      .format('X');

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      role: user.role,
    };
  }

  private async generateTokens(user: User) {
    const refreshTokenId = uuid();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, phone: user.phone, fullName: user.fullName },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    console.log(
      this.jwtConfiguration.refreshTokenTtl,
      this.jwtConfiguration.accessTokenTtl,
    );

    return { accessToken, refreshToken };
  }

  private async signToken<T>(
    userId: string,
    expiresIn: string | number,
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      return payload;
    } catch (e) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
