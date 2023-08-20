import { InputType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../common/order/order';

export enum MessageOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  content = 'content',
  type = 'type',
}

registerEnumType(MessageOrderField, {
  name: 'MessageOrderField',
  description: 'Properties by which message connections can be ordered.',
});

@InputType()
export class MessageOrder extends Order {
  field: MessageOrderField;
}
