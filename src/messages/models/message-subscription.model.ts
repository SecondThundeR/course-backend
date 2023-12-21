import { Field, ObjectType } from '@nestjs/graphql';

import { UpdateType } from '@/common/subscription/update-type';
import { Message } from './message.model';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
export class MessageSubscription {
  @Field(() => UpdateType)
  @IsNotEmpty()
  type: UpdateType;

  @Field(() => Message)
  @IsNotEmpty()
  message: Message;
}
