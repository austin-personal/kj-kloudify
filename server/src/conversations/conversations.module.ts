import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],  // 다른 모듈에서 사용하기 위해 export
})
export class ConversationsModule {}
