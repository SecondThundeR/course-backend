import { ObjectType } from '@nestjs/graphql';

import PaginatedResponse from '@/common/pagination/pagination';

import { Conversation } from './conversation.model';

@ObjectType()
export class ConversationConnection extends PaginatedResponse(Conversation) {}
