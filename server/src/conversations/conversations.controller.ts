import { Controller, Post, Body } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('ask')
  async askModel(@Body('message') message: string) {
    const response = await this.conversationsService.askBedrockModel(message);
    return response;
  }
}
