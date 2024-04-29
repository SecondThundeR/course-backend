import { Module } from '@nestjs/common';

import { AnonymousMessagesResolver } from './anonymous-messages.resolver';

@Module({
  imports: [],
  providers: [AnonymousMessagesResolver],
})
export class AnonymousMessagesModule {}
