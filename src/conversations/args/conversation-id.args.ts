import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class ConversationIdArgs {
  @Field()
  @IsNotEmpty()
  conversationId: string;
}
