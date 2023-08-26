import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @Field(() => String)
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
