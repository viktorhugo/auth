import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';

@Module({
  imports: [
    DynamodbModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: envs.jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
