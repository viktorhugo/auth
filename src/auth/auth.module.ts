import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';

@Module({
  imports: [DynamodbModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
