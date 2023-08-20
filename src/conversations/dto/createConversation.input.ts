import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateConversationInput {
  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => [String])
  @IsNotEmpty()
  participantsIds: string[];
}
