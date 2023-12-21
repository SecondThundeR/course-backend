import { PrismaService } from 'nestjs-prisma';
import {
  Resolver,
  Query,
  Parent,
  Args,
  ResolveField,
  Subscription,
  Mutation,
} from '@nestjs/graphql';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { PubSub } from 'graphql-subscriptions';
import { BadRequestException, UseGuards } from '@nestjs/common';

import { PaginationArgs } from '@/common/pagination/pagination.args';
import { UserEntity } from '@/common/decorators/user.decorator';
import { User } from '@/users/models/user.model';
import { Message } from '@/messages/models/message.model';
import { GqlAuthGuard } from '@/auth/gql-auth.guard';

import { ConversationIdArgs } from './args/conversation-id.args';
import { UserIdArgs } from './args/user-id.args';
import { ConversationOrder } from './dto/conversation-order.input';
import { CreateConversationInput } from './dto/create-conversation.input';
import { ConversationConnection } from './models/conversation-connection.model';
import { Conversation } from './models/conversation.model';
import { DeleteConversationInput } from './dto/delete-conversation.input';
import { ConversationSubscription } from './models/conversation-subscription.model';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const pubSub = new PubSub();

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(private prisma: PrismaService) {}

  @Subscription(() => ConversationSubscription, {
    filter: (
      payload: { conversationUpdates: ConversationSubscription },
      variables: { userId: string },
    ) => {
      const { userId } = variables;
      return (
        payload.conversationUpdates.conversation.creatorId !== userId &&
        payload.conversationUpdates.conversation.participants.findIndex(
          (participant) => participant.id === userId,
        ) !== -1
      );
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  conversationUpdates(@Args('userId') userId: string) {
    return pubSub.asyncIterator('conversationUpdates');
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Conversation)
  async createConversation(
    @UserEntity() user: User,
    @Args('data') data: CreateConversationInput,
  ) {
    const { title, participantsIds } = data;
    const newConversation = await this.prisma.conversation.create({
      data: {
        title,
        participants: {
          connect: [
            { id: user.id },
            ...participantsIds.map((userId) => ({ id: userId })),
          ],
        },
        creatorId: user.id,
      },
      include: {
        participants: true,
      },
    });
    await pubSub.publish('conversationUpdates', {
      conversationUpdates: {
        type: 'ADDED',
        conversation: newConversation,
      },
    });
    return newConversation;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Conversation)
  async deleteConversation(
    @UserEntity() _user: User,
    @Args('data') data: DeleteConversationInput,
  ) {
    const { conversationId } = data;
    try {
      const deletedConversation = await this.prisma.conversation.delete({
        where: {
          id: conversationId,
        },
        include: {
          participants: true,
        },
      });

      await pubSub.publish('conversationUpdates', {
        conversationUpdates: {
          type: 'DELETED',
          conversation: deletedConversation,
        },
      });
      return deletedConversation;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException(
            'Failed to delete conversation for provided ID',
          );
        }
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => ConversationConnection)
  async conversations(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => ConversationOrder,
      nullable: true,
    })
    orderBy: ConversationOrder,
  ) {
    const cursor = await findManyCursorConnection(
      (args) =>
        this.prisma.conversation.findMany({
          include: { messages: true, participants: true },
          where: {
            title: { contains: query || '' },
          },
          orderBy: orderBy
            ? [
                { [orderBy.field]: orderBy.direction },
                {
                  id: 'desc',
                },
              ]
            : undefined,
          ...args,
        }),
      () =>
        this.prisma.conversation.count({
          where: {
            title: { contains: query || '' },
          },
        }),
      { first, last, before, after },
    );
    return cursor;
  }

  @Query(() => Conversation)
  async conversation(@Args() id: ConversationIdArgs) {
    return await this.prisma.conversation.findUnique({
      where: { id: id.conversationId },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Conversation])
  async userConversations(@Args() id: UserIdArgs) {
    return await this.prisma.user
      .findUnique({ where: { id: id.userId } })
      .conversations();
  }

  @ResolveField('participants', () => [User])
  async participants(@Parent() conversation: Conversation) {
    return await this.prisma.conversation
      .findUnique({ where: { id: conversation.id } })
      .participants();
  }

  @ResolveField('messages', () => [Message])
  async messages(@Parent() conversation: Conversation) {
    return await this.prisma.conversation
      .findUnique({ where: { id: conversation.id } })
      .messages();
  }
}
