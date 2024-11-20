import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Auth } from 'src/iam/authentication/decorators/auth-decorators';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { CreateMessageDto } from './dto/create-message.dto';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';

@Controller('message')
@Auth(AuthType.Bearer)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() body: CreateMessageDto, @ActiveUser() user: ActiveUserData) {
    return this.messageService.create(body, user);
  }

  @Get('room/:roomId')
  findMany(
    @Param('roomId') roomId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.messageService.findMany(roomId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.messageService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: CreateMessageDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.messageService.update(id, body, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.messageService.delete(id, user);
  }
}
