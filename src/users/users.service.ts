import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const isEmailOrPhoneExists = await this.findByEmailOrPhone(
      createUserDto.email,
      createUserDto.phone,
    );

    if (isEmailOrPhoneExists) {
      throw new BadRequestException('Email or phone already exists');
    }

    return this.databaseService.user.create({
      data: {
        ...createUserDto,
      },
    });
  }

  async findAll() {
    return this.databaseService.user.findMany();
  }

  async findByEmailOrPhone(email: string, phone: string) {
    return this.databaseService.user.findFirst({
      where: {
        OR: [{ phone }, { email }],
      },
    });
  }

  async findByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByPhone(phone: string) {
    return this.databaseService.user.findUnique({
      where: {
        phone,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.databaseService.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
      },
    });
  }

  async remove(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.databaseService.user.delete({
      where: {
        id,
      },
    });
  }
}
