import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { Auth } from 'src/iam/authentication/decorators/auth-decorators';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { CreateRoomDto } from './dto/create-room.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('room')
@Auth(AuthType.Bearer)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  createRoom(
    @Body() createRoomDto: CreateRoomDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.roomService.create(createRoomDto, user);
  }

  @Get()
  findMany() {
    return this.roomService.findMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.roomService.update(id, updateRoomDto, user);
  }

  @Delete(':id')
  deleteRoom(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.roomService.delete(id, user);
  }
}
