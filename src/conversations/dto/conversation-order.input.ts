import { InputType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../common/order/order';

export enum ConversationOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

registerEnumType(ConversationOrderField, {
  name: 'ConversationOrderField',
  description: 'Properties by which conversation connections can be ordered.',
});

@InputType()
export class ConversationOrder extends Order {
  field: ConversationOrderField;
}
