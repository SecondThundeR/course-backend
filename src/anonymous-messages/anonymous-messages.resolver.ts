import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Resolver, Query, Args, Subscription, Mutation } from '@nestjs/graphql';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { PubSub } from 'graphql-subscriptions';
import { faker } from '@faker-js/faker';

import { PaginationArgs } from '@/common/pagination/pagination.args';
import { UpdateType } from '@/common/subscription/update-type';

import { MessageOrder } from '@/messages/dto/message-order.input';
import { MessageConnection } from '@/messages/models/message-connection.model';

import { CreateAnonymousMessageInput } from './dto/create-anonymous-message.input';
import { AnonymousMessageSubscription } from './models/anonymous-message-subscription.model';
import { AnonymousMessage } from './models/anonymous-message.model';

const pubSub = new PubSub();

const MAX_USERNAME_GENERATE_ATTEMPTS = 5;

// ! (Really important) Note about this
// Actually, this implementation is so FAR from perfect and was rushed out
// because of course project deadline and my failure to come up with something
// more brilliant than this xd
// So, this will be only used in frontend part just for course project demo and
// it should NOT be used seriously as it has many intentional flaws and design decisions
@Resolver(() => AnonymousMessage)
export class AnonymousMessagesResolver {
  constructor(private prisma: PrismaService) {}

  // There is no need to filter, as anonymous chat is basically one shared chat room
  @Subscription(() => AnonymousMessageSubscription, {
    name: 'anonymousMessageUpdates',
  })
  anonymousMessageUpdates() {
    return pubSub.asyncIterator('anonymousMessageUpdates');
  }

  // Trying to ensure, that generated username is not colliding with others
  // by checking if message with generated username is exists
  // (Well, it is better to implement some kind of purging after some time, but it's not an
  // option for now)
  @Query(() => String)
  async assignRandomUsername() {
    let attempts = 0;

    while (attempts < MAX_USERNAME_GENERATE_ATTEMPTS) {
      const newRandomUsername = `${faker.commerce.productAdjective()}-${faker.commerce.department()}-${faker.git.commitSha({ length: 7 })}`;

      if (
        (await this.prisma.anonymousMessage.findFirst({
          where: {
            fromId: newRandomUsername,
          },
        })) === null
      )
        return newRandomUsername;

      attempts++;
    }

    throw new BadRequestException(
      'Failed to generate new random username. Try again later',
    );
  }

  @Mutation(() => AnonymousMessage)
  async createAnonymousMessage(
    @Args('data') data: CreateAnonymousMessageInput,
  ) {
    const { content, type, fromId } = data;
    const newMessage = await this.prisma.anonymousMessage.create({
      data: {
        content,
        type,
        fromId: fromId,
      },
    });

    await pubSub.publish('anonymousMessageUpdates', {
      anonymousMessageUpdates: {
        type: UpdateType.ADDED,
        message: newMessage,
      },
    });
    return newMessage;
  }

  @Query(() => MessageConnection)
  async anonymousMessages(
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
        this.prisma.anonymousMessage.findMany({
          where: {
            content: { contains: query || '' },
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
        await this.prisma.anonymousMessage.count({
          where: {
            content: { contains: query || '' },
          },
        }),
      { first, last, before, after },
    );
    return cursor;
  }
}
