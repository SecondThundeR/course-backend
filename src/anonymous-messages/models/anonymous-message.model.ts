import { MessageType } from '@prisma/client';
import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '@/common/models/base.model';

@ObjectType()
export class AnonymousMessage extends BaseModel {
  @Field(() => String)
  content: string;

  @Field(() => MessageType)
  type: MessageType;

  // Represents dynamically assigned username
  @Field(() => String)
  fromId: string;
}
