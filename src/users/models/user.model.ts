import 'reflect-metadata';
import { ObjectType, HideField, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

import { Conversation } from 'src/conversations/models/conversation.model';
import { BaseModel } from 'src/common/models/base.model';
import { Message } from 'src/messages/models/message.model';

@ObjectType()
export class User extends BaseModel {
  @Field(() => String)
  @IsEmail()
  email: string;

  @HideField()
  password: string;

  @Field(() => String, { nullable: true })
  firstname?: string;

  @Field(() => String, { nullable: true })
  lastname?: string;

  @Field(() => [Conversation])
  conversations: Conversation[];

  @Field(() => [Message])
  messages: Message[];
}
