import { ObjectType } from '@nestjs/graphql';

import PaginatedResponse from 'src/common/pagination/pagination';

import { Message } from './message.model';

@ObjectType()
export class MessageConnection extends PaginatedResponse(Message) {}
