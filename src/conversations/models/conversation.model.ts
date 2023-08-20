import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { BaseModel } from '../../common/models/base.model';
import { Message } from '../../messages/models/message.model';

@ObjectType()
export class Conversation extends BaseModel {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => [Message])
  messages: Message[];

  @Field(() => [User])
  participants: User[];

  @Field(() => String)
  creatorId: string;
}
