import { MessageType } from '@prisma/client';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { User } from 'src/users/models/user.model';
import { BaseModel } from 'src/common/models/base.model';
import { Conversation } from 'src/conversations/models/conversation.model';

registerEnumType(MessageType, {
  name: 'MessageType',
  description: 'Type of message',
});

@ObjectType()
export class Message extends BaseModel {
  @Field(() => String)
  content: string;

  @Field(() => [String])
  contentHistory: string[];

  @Field(() => MessageType)
  type: MessageType;

  @Field(() => User, { nullable: true })
  from?: User | null;

  @Field(() => Conversation, { nullable: true })
  conversation?: Conversation | null;
}
