import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly userSelectFields = {
    id: true,
    fullName: true,
  };

  async create(createRoomDto: CreateRoomDto, user: ActiveUserData) {
    return this.databaseService.chatRoom.create({
      data: {
        ...createRoomDto,
        created_by_user_id: user.sub,
        user_ids: {
          set: [user.sub],
        },
      },
    });
  }

  async joinRoom(id: string, user: ActiveUserData) {
    const room = await this.databaseService.chatRoom.findUnique({
      where: { id },
      select: { user_ids: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.user_ids.includes(user.sub)) {
      return this.findOne(id);
    }

    return this.databaseService.chatRoom.update({
      where: { id },
      data: {
        user_ids: {
          set: [...room.user_ids, user.sub],
        },
      },
      select: {
        users: { select: this.userSelectFields },
      },
    });
  }

  async findMany() {
    return this.databaseService.chatRoom.findMany({
      select: {
        id: true,
        name: true,
        created_by_user_id: true,
        users: { select: this.userSelectFields },
      },
    });
  }

  async findOne(id: string) {
    const room = await this.databaseService.chatRoom.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        created_by_user_id: true,
        users: { select: this.userSelectFields },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto, user: ActiveUserData) {
    await this.checkAccessToEdit(id, user);

    return this.databaseService.chatRoom.update({
      where: { id },
      data: updateRoomDto,
      select: {
        id: true,
        name: true,
        created_by_user_id: true,
        users: { select: this.userSelectFields },
      },
    });
  }

  async delete(id: string, user: ActiveUserData) {
    await this.checkAccessToEdit(id, user);

    return this.databaseService.chatRoom.delete({
      where: { id },
    });
  }

  async checkAccessToRoom(id: string, user: ActiveUserData) {
    const room = await this.databaseService.chatRoom.findUnique({
      where: { id },
      select: { user_ids: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (!room.user_ids.includes(user.sub)) {
      throw new UnauthorizedException(
        'You are not allowed to access this room',
      );
    }
  }

  private async checkAccessToEdit(id: string, user: ActiveUserData) {
    const room = await this.databaseService.chatRoom.findUnique({
      where: { id },
      select: { created_by_user_id: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.created_by_user_id !== user.sub) {
      throw new UnauthorizedException(
        'You are not allowed to modify this room',
      );
    }
  }
}
