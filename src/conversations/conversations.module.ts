import { Module } from '@nestjs/common';
import { ConversationsResolver } from './conversations.resolver';

@Module({
  imports: [],
  providers: [ConversationsResolver],
})
export class ConversationsModule {}
