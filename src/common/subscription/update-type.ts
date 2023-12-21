import { registerEnumType } from '@nestjs/graphql';

export enum UpdateType {
  ADDED = 'ADDED',
  DELETED = 'DELETED',
}

registerEnumType(UpdateType, {
  name: 'UpdateType',
});
