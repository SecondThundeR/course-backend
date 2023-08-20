import { Module } from '@nestjs/common';
import { MessagesResolver } from './messages.resolver';

@Module({
  imports: [],
  providers: [MessagesResolver],
})
export class MessagesModule {}
