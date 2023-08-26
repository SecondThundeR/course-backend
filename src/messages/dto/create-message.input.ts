import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { MessageType } from '@prisma/client';

@InputType()
export class CreateMessageInput {
  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => MessageType, {
    nullable: true,
  })
  type?: MessageType = 'REGULAR';

  @Field(() => String)
  @IsNotEmpty()
  conversationId: string;
}
