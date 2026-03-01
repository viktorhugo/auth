import { AuthUserDto } from '../dto/login-response.dto';

export class User {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly userId: string,
    public readonly password: string,
    public readonly createdAt: string,
  ) {}

  static fromDynamo(item: Record<string, unknown>): User {
    return new User(
      item.email as string,
      item.name as string,
      item.userId as string,
      item.password as string,
      item.createdAt as string,
    );
  }

  toAuthUser(): AuthUserDto {
    return {
      email: this.email,
      name: this.name,
      userId: this.userId,
    };
  }
}
