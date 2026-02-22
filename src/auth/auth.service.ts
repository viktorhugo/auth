import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

const SALT_ROUNDS = 10;
const TABLE = 'authentications';

@Injectable()
export class AuthService {
  constructor(private readonly dynamodbService: DynamodbService) {}

  async login(payload: LoginUserDto) {
    const user = await this.dynamodbService.getItem(TABLE, {
      email: payload.email,
    });

    if (!user) {
      throw new RpcException({ status: 401, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password as string,
    );

    if (!isPasswordValid) {
      throw new RpcException({ status: 401, message: 'Invalid credentials' });
    }

    return { pass: true, user: this.omitPassword(user) };
  }

  async register(dto: RegisterUserDto) {
    const existingUser = await this.dynamodbService.getItem(TABLE, {
      email: dto.email,
    });

    if (existingUser) {
      throw new RpcException({ status: 409, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const newUser = {
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      userId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await this.dynamodbService.putItem(TABLE, newUser);

    return this.omitPassword(newUser);
  }

  async verify(payload: any) {
    return payload;
  }

  omitPassword = (user: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(user).filter(([key]) => key !== 'password'),
    );
}
