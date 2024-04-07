import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class EditMessageInput {
  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => String)
  @IsNotEmpty()
  messageId: string;

  @Field(() => String)
  @IsNotEmpty()
  conversationId: string;
}
