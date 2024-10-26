import { Controller, Post, Body } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('ask')
  async askModel(
    @Body('message') message: string, 
    @Body('CID') CID: string // CID 추가
  ) {
    const response = await this.conversationsService.askBedrockModel(message, CID); // CID 전달
    return response;
  }

  @Post('increment')
  incrementCounter(): string {
      ConversationsService.incrementModelCounter();
      return `Counter incremented to ${ConversationsService.modelSwitchCounter}`;
  }

  @Post('open')
  async openConversation(@Body('CID') CID: number): Promise<any> {
    const chatHistory = await this.conversationsService.getConversationsByCID(CID); // 함수명 일치시킴
    return chatHistory;
  }

}

