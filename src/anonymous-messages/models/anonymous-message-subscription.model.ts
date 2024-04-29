import { Field, ObjectType } from '@nestjs/graphql';

import { UpdateType } from '@/common/subscription/update-type';
import { IsNotEmpty } from 'class-validator';
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
