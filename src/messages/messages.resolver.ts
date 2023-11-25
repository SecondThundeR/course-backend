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
import { UseGuards } from '@nestjs/common';
import { PaginationArgs } from '../common/pagination/pagination.args';
import { UserEntity } from '../common/decorators/user.decorator';
import { User } from '../users/models/user.model';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { MessageIdArgs } from './args/message-id.args';
import { UserIdArgs } from './args/user-id.args';
import { Message } from './models/message.model';
import { MessageConnection } from './models/message-connection.model';
import { MessageOrder } from './dto/message-order.input';
import { CreateMessageInput } from './dto/create-message.input';

const pubSub = new PubSub();

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private prisma: PrismaService) {}

  @Subscription(() => Message, {
    filter(payload, _, context) {
      if (!context?.req?.extra?.user) return false;
      const userId = context.req.extra.user.id;
      return payload.messageCreated.fromId !== userId;
    },
  })
  messageCreated() {
    return pubSub.asyncIterator('messageCreated');
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
        type,
        conversationId,
        fromId: user.id,
      },
    });
    await pubSub.publish('messageCreated', { messageCreated: newMessage });
    return newMessage;
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
    return await this.prisma.message.findUnique({
      where: { id: id.messageId },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Message])
  async userMessages(@Args() id: UserIdArgs) {
    return await this.prisma.user
      .findUnique({ where: { id: id.userId } })
      .messages();
  }

  @ResolveField('from', () => User)
  async from(@Parent() message: Message) {
    return await this.prisma.message
      .findUnique({ where: { id: message.id } })
      .from();
  }
}
