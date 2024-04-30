import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

import { UpdateType } from '@/common/subscription/update-type';

import { AnonymousMessage } from './anonymous-message.model';

@ObjectType()
export class AnonymousMessageSubscription {
  @Field(() => UpdateType)
  @IsNotEmpty()
  type: UpdateType;

  @Field(() => AnonymousMessage)
  @IsNotEmpty()
  message: AnonymousMessage;
}
