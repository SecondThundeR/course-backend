/* eslint-disable */
export default async () => {
  const t = {
    ['./users/models/user.model']: await import('./users/models/user.model'),
    ['./conversations/dto/conversation-order.input']: await import(
      './conversations/dto/conversation-order.input'
    ),
    ['./messages/dto/message-order.input']: await import(
      './messages/dto/message-order.input'
    ),
  };
  return {
    '@nestjs/graphql/plugin': {
      models: [
        [
          import('./auth/dto/signup.input'),
          {
            SignupInput: {
              email: {},
              password: {},
              firstname: { nullable: true },
              lastname: { nullable: true },
            },
          },
        ],
        [
          import('./auth/models/token.model'),
          { Token: { accessToken: {}, refreshToken: {} } },
        ],
        [
          import('./common/models/base.model'),
          { BaseModel: { id: {}, createdAt: {}, updatedAt: {} } },
        ],
        [
          import('./messages/models/message.model'),
          {
            Message: {
              content: {},
              contentHistory: {},
              type: {},
              from: { nullable: true },
              conversation: { nullable: true },
            },
          },
        ],
        [
          import('./conversations/models/conversation.model'),
          {
            Conversation: {
              title: { nullable: true },
              messages: {},
              participants: {},
              creatorId: {},
            },
          },
        ],
        [
          import('./users/models/user.model'),
          {
            User: {
              email: {},
              firstname: { nullable: true },
              lastname: { nullable: true },
              conversations: {},
              messages: {},
            },
          },
        ],
        [
          import('./auth/models/auth.model'),
          {
            Auth: { user: { type: () => t['./users/models/user.model'].User } },
          },
        ],
        [
          import('./auth/dto/login.input'),
          { LoginInput: { email: {}, password: {} } },
        ],
        [
          import('./auth/dto/refresh-token.input'),
          { RefreshTokenInput: { token: {} } },
        ],
        [
          import('./users/dto/change-password.input'),
          { ChangePasswordInput: { oldPassword: {}, newPassword: {} } },
        ],
        [
          import('./users/dto/update-user.input'),
          {
            UpdateUserInput: {
              firstname: { nullable: true },
              lastname: { nullable: true },
            },
          },
        ],
        [
          import('./common/pagination/pagination.args'),
          {
            PaginationArgs: {
              skip: { nullable: true, type: () => Number },
              after: { nullable: true, type: () => String },
              before: { nullable: true, type: () => String },
              first: { nullable: true, type: () => Number },
              last: { nullable: true, type: () => Number },
            },
          },
        ],
        [
          import('./conversations/args/conversation-id.args'),
          { ConversationIdArgs: { conversationId: {} } },
        ],
        [
          import('./conversations/args/user-id.args'),
          { UserIdArgs: { userId: {} } },
        ],
        [
          import('./common/pagination/page-info.model'),
          {
            PageInfo: {
              endCursor: { nullable: true },
              hasNextPage: {},
              hasPreviousPage: {},
              startCursor: { nullable: true },
            },
          },
        ],
        [
          import('./conversations/models/conversation-connection.model'),
          { ConversationConnection: {} },
        ],
        [
          import('./conversations/dto/conversation-order.input'),
          {
            ConversationOrder: {
              field: {
                type: () =>
                  t['./conversations/dto/conversation-order.input']
                    .ConversationOrderField,
              },
            },
          },
        ],
        [
          import('./conversations/dto/create-conversation.input'),
          {
            CreateConversationInput: {
              title: { nullable: true },
              participantsIds: {},
            },
          },
        ],
        [
          import('./messages/args/message-id.args'),
          { MessageIdArgs: { messageId: {} } },
        ],
        [
          import('./messages/args/user-id.args'),
          { UserIdArgs: { userId: {} } },
        ],
        [
          import('./messages/models/message-connection.model'),
          { MessageConnection: {} },
        ],
        [
          import('./messages/dto/message-order.input'),
          {
            MessageOrder: {
              field: {
                type: () =>
                  t['./messages/dto/message-order.input'].MessageOrderField,
              },
            },
          },
        ],
        [
          import('./messages/dto/create-message.input'),
          {
            CreateMessageInput: {
              content: {},
              type: { nullable: true },
              conversationId: {},
            },
          },
        ],
      ],
    },
  };
};
