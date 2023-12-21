import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

import { UpdateType } from '@/common/subscription/update-type';
import { Conversation } from './conversation.model';

@ObjectType()
export class ConversationSubscription {
  @Field(() => UpdateType)
  @IsNotEmpty()
  type: UpdateType;

  @Field(() => Conversation)
  @IsNotEmpty()
  conversation: Conversation;
}
