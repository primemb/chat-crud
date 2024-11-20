import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RoomService } from 'src/room/room.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly roomService: RoomService,
  ) {}

  async create(createMessageDto: CreateMessageDto, user: ActiveUserData) {
    await this.roomService.checkAccessToRoom(createMessageDto.room_id, user);

    return this.databaseService.message.create({
      data: {
        content: createMessageDto.content,
        chat_room_id: createMessageDto.room_id,
        user_id: user.sub,
      },
    });
  }

  async findMany(roomId: string, user: ActiveUserData) {
    await this.roomService.checkAccessToRoom(roomId, user);

    return this.databaseService.message.findMany({
      where: { chat_room_id: roomId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findOne(id: string, user: ActiveUserData) {
    const message = await this.databaseService.message.findFirst({
      where: { id, user_id: user.sub },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return message;
  }

  async update(
    messageId: string,
    upadeMessageDto: UpdateMessageDto,
    user: ActiveUserData,
  ) {
    const message = await this.databaseService.message.findFirst({
      where: { id: messageId, user_id: user.sub },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.databaseService.message.update({
      where: { id: messageId },
      data: { content: upadeMessageDto.content },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async delete(id: string, user: ActiveUserData) {
    const message = await this.databaseService.message.findFirst({
      where: { id, user_id: user.sub },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.databaseService.message.delete({ where: { id } });
  }
}
