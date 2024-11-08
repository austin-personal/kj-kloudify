import { Controller, Post, Body } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('ask')
  async askModel(
    @Body('message') message: string, 
    @Body('CID') CID: number // CID 추가
  ) {
    const response = await this.conversationsService.askBedrockModel(message, CID); // CID 전달
    return response;
  }

  @Post('fetch')
  async fetchKeywords(@Body('CID') CID: number): Promise<any> {
    return this.conversationsService.fetchExistingKeywords(CID); // 인스턴스 메서드 호출
  }

  @Post('open')
  async openConversation(@Body('CID') CID: number): Promise<any> {
    const chatHistory = await this.conversationsService.getConversationsByCID(CID); // 함수명 일치시킴
    return chatHistory;
  }

}

