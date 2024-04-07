import { registerEnumType } from '@nestjs/graphql';

export enum UpdateType {
  ADDED = 'ADDED',
  EDITED = 'EDITED',
  DELETED = 'DELETED',
}

registerEnumType(UpdateType, {
  name: 'UpdateType',
});
