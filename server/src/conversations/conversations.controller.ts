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
}

