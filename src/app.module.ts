import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DynamodbModule } from './dynamodb/dynamodb.module';

@Module({
  imports: [DynamodbModule, AuthModule],
})
export class AppModule {}
