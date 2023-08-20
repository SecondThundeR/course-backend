import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { MessageType } from '@prisma/client';

@InputType()
export class CreateMessageInput {
  @Field()
  @IsNotEmpty()
  content: string;

  @Field(() => MessageType, {
    nullable: true,
  })
  type?: MessageType = 'REGULAR';

  @Field()
  @IsNotEmpty()
  conversationId: string;
}
