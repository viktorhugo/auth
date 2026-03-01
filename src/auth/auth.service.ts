import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { envs } from 'src/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtVerifyData } from './interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';

const TABLE = 'authentications';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly dynamodbService: DynamodbService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = payload;
    try {
      const dynamoUser = await this.dynamodbService.getItem(TABLE, { email });

      if (!dynamoUser) {
        throw new RpcException({ status: 401, message: 'Invalid credentials' });
      }

      const user = User.fromDynamo(dynamoUser);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({ status: 401, message: 'Invalid credentials' });
      }

      const payload: JwtPayload = {
        email: user.email,
        userId: user.userId,
        name: user.name,
      };
      const token = await this.generateJwtToken(payload);

      return {
        pass: true,
        user: user.toAuthUser(),
        token,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      throw new RpcException({
        status: 400,
        message: errorMessage,
      });
    }
  }

  async registerUser(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    const { email, name, password } = registerUserDto;
    try {
      const existingUser = await this.dynamodbService.getItem(TABLE, { email });

      if (existingUser) {
        throw new RpcException({
          status: 409,
          message: 'Email already in use',
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        envs.passwordSaltRounds,
      );

      const newUser = {
        email,
        name,
        password: hashedPassword,
        userId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      await this.dynamodbService.putItem(TABLE, newUser);

      const user = User.fromDynamo(newUser);

      const jwtPayload: JwtPayload = {
        email: user.email,
        userId: user.userId,
        name: user.name,
      };
      const token = await this.generateJwtToken(jwtPayload);

      return { user: user.toAuthUser(), token };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      throw new RpcException({
        status: 400,
        message: errorMessage,
      });
    }
  }

  public async verifyToken(token: string) {
    if (!token) {
      throw new RpcException({
        status: 401,
        message: 'Token is required',
      });
    }
    try {
      const { email, userId, name } =
        await this.jwtService.verifyAsync<JwtVerifyData>(token, {
          secret: envs.jwtSecret,
        });
      return {
        user: { userId, name, email },
        token: await this.generateJwtToken({ email, userId, name }),
      };
    } catch {
      throw new RpcException({
        status: 401,
        message: 'Invalid verify token',
      });
    }
  }

  public omitPassword = (user: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(user).filter(([key]) => key !== 'password'),
    );

  private async generateJwtToken(payload: JwtPayload): Promise<string> {
    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
