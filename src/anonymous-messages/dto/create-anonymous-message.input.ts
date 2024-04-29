import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { MessageType } from '@prisma/client';

@InputType()
export class CreateAnonymousMessageInput {
  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => MessageType, {
    nullable: true,
  })
  type?: MessageType = 'REGULAR';

  // Represents dynamically assigned username
  @Field(() => String)
  fromId: string;
}
