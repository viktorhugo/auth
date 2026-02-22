import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { envs } from '../config';

@Injectable()
export class DynamodbService implements OnModuleInit {
  private readonly logger = new Logger(DynamodbService.name);
  private client: DynamoDBDocumentClient;

  onModuleInit() {
    const rawClient = new DynamoDBClient({
      region: envs.awsRegion,
      endpoint: envs.dynamodbEndpoint,
      credentials: {
        accessKeyId: envs.awsAccessKeyId,
        secretAccessKey: envs.awsSecretAccessKey,
      },
    });

    this.client = DynamoDBDocumentClient.from(rawClient);
    this.logger.log(`DynamoDB connected → ${envs.dynamodbEndpoint}`);
  }

  async putItem(
    tableName: string,
    item: Record<string, unknown>,
  ): Promise<void> {
    await this.client.send(new PutCommand({ TableName: tableName, Item: item }));
  }

  async getItem(
    tableName: string,
    key: Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined> {
    const result = await this.client.send(
      new GetCommand({ TableName: tableName, Key: key }),
    );
    return result.Item;
  }

  async deleteItem(
    tableName: string,
    key: Record<string, unknown>,
  ): Promise<void> {
    await this.client.send(
      new DeleteCommand({ TableName: tableName, Key: key }),
    );
  }

  async queryItems(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      }),
    );
    return result.Items ?? [];
  }
}
