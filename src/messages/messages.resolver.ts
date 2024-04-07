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
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import { PaginationArgs } from '@/common/pagination/pagination.args';
import { UserEntity } from '@/common/decorators/user.decorator';
import { User } from '@/users/models/user.model';
import { GqlAuthGuard } from '@/auth/gql-auth.guard';

import { MessageIdArgs } from './args/message-id.args';
import { UserIdArgs } from './args/user-id.args';
import { MessageOrder } from './dto/message-order.input';
import { CreateMessageInput } from './dto/create-message.input';
import { MessageConnection } from './models/message-connection.model';
import { Message } from './models/message.model';
import { MessageSubscription } from './models/message-subscription.model';
import { Conversation } from '@/conversations/models/conversation.model';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EditMessageInput } from './dto/edit-message.input';

const pubSub = new PubSub();

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private prisma: PrismaService) {}

  @Subscription(() => MessageSubscription, {
    filter: (
      payload: { messageUpdates: MessageSubscription },
      variables: { userId: string },
    ) => {
      const { userId } = variables;
      return (
        payload.messageUpdates.message.from.id !== userId &&
        payload.messageUpdates.message.conversation.participants.findIndex(
          (participant) => participant.id === userId,
        ) !== -1
      );
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  messageUpdates(@Args('userId') userId: string) {
    return pubSub.asyncIterator('messageUpdates');
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async createMessage(
    @UserEntity() user: User,
    @Args('data') data: CreateMessageInput,
  ) {
    const { content, type, conversationId } = data;
    const newMessage = await this.prisma.message.create({
      data: {
        content,
        contentHistory: {
          set: [content],
        },
        type,
        fromId: user.id,
        conversationId: conversationId,
      },
      include: {
        from: {
          select: {
            id: true,
          },
        },
        conversation: {
          select: {
            participants: true,
          },
        },
      },
    });

    await pubSub.publish('messageUpdates', {
      messageUpdates: {
        type: 'ADDED',
        message: newMessage,
      },
    });
    return newMessage;
  }

  /**
   * @description Message type cannot be edited intentionally,
   * because there is a chance that user can mixup type and content
   * and send LaTeX as regular message or vice versa
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async editMessage(
    @UserEntity() user: User,
    @Args('data') data: EditMessageInput,
  ) {
    try {
      const { content, conversationId, messageId } = data;
      const updatedMessage = await this.prisma.message.update({
        data: {
          content,
          contentHistory: {
            push: content,
          },
        },
        where: {
          id: messageId,
          conversationId,
          fromId: user.id,
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          },
        },
        include: {
          from: {
            select: {
              id: true,
            },
          },
          conversation: {
            select: {
              participants: true,
            },
          },
        },
      });

      if (!updatedMessage) {
        throw new NotFoundException('Message not found');
      }

      await pubSub.publish('messageUpdates', {
        messageUpdates: {
          type: 'CHANGED',
          message: updatedMessage,
        },
      });

      return updatedMessage;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException(
            'Failed to update message for provided ID',
          );
        }
        throw new InternalServerErrorException(
          'Something went wrong when updating message',
        );
      }

      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async deleteMessage(@UserEntity() _user: User, @Args() id: MessageIdArgs) {
    try {
      const deletedMessage = await this.prisma.message.update({
        where: {
          id: id.messageId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
        },
        include: {
          from: {
            select: {
              id: true,
            },
          },
          conversation: {
            select: {
              participants: true,
            },
          },
        },
      });

      await pubSub.publish('messageUpdates', {
        messageUpdates: {
          type: 'DELETED',
          message: deletedMessage,
        },
      });

      return deletedMessage;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException(
            'Failed to delete message for provided ID',
          );
        }
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => MessageConnection)
  async messages(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => MessageOrder,
      nullable: true,
    })
    orderBy: MessageOrder,
  ) {
    const cursor = await findManyCursorConnection(
      (args) =>
        this.prisma.message.findMany({
          include: { from: true },
          where: {
            isDeleted: false,
            OR: [
              {
                content: { contains: query || '' },
              },
              {
                contentHistory: {
                  has: query || '',
                },
              },
            ],
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
      async () =>
        await this.prisma.message.count({
          where: {
            isDeleted: false,
            OR: [
              {
                content: { contains: query || '' },
              },
              {
                contentHistory: {
                  has: query || '',
                },
              },
            ],
          },
        }),
      { first, last, before, after },
    );
    return cursor;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Message)
  async message(@Args() id: MessageIdArgs) {
    return await this.prisma.message.findUniqueOrThrow({
      where: { id: id.messageId, isDeleted: false },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Message])
  async userMessages(@Args() id: UserIdArgs) {
    return await this.prisma.message.findMany({
      where: {
        fromId: id.userId,
        isDeleted: false,
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  @ResolveField('from', () => User)
  async from(@Parent() message: Message) {
    return await this.prisma.message
      .findUnique({ where: { id: message.id } })
      .from();
  }

  @ResolveField('conversation', () => Conversation)
  async conversation(@Parent() message: Message) {
    return await this.prisma.message
      .findUnique({ where: { id: message.id } })
      .conversation();
  }
}
