import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class MessageIdArgs {
  @Field()
  @IsNotEmpty()
  messageId: string;
}
