import { GraphqlConfig } from './common/configs/config.interface';
import { ConfigService } from '@nestjs/config';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { AuthService } from './auth/auth.service';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql');
    const getUserFromToken = async (token: string) =>
      await this.authService.getUserFromToken(token);
    return {
      autoSchemaFile: graphqlConfig.schemaDestination || './src/schema.graphql',
      sortSchema: graphqlConfig.sortSchema,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      introspection: graphqlConfig.playgroundEnabled,
      subscriptions: {
        'graphql-ws': {
          onConnect: async (context) => {
            const { connectionParams, extra } = context;
            if (!connectionParams?.authToken) return false;

            const authToken = connectionParams.authToken as string;
            const user = await getUserFromToken(authToken);
            if (!user) return false;

            extra['user'] = user;
          },
        },
        'subscriptions-transport-ws': false,
      },
      includeStacktraceInErrorResponses: graphqlConfig.debug,
      playground: false,
      plugins: [
        graphqlConfig.playgroundEnabled
          ? ApolloServerPluginLandingPageLocalDefault()
          : ApolloServerPluginLandingPageDisabled(),
      ],
      context: ({ req }) => ({ req }),
    };
  }
}
