import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthMessage } from 'src/enum/auth.enum';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: AuthMessage.AUTH_LOGIN })
  async login(@Payload() payload: LoginUserDto) {
    return await this.authService.login(payload);
  }

  @MessagePattern({ cmd: AuthMessage.AUTH_REGISTER })
  async register(@Payload() payload: RegisterUserDto) {
    return await this.authService.registerUser(payload);
  }

  @MessagePattern({ cmd: AuthMessage.AUTH_VERIFY })
  async verify(@Payload() payload: { token: string }) {
    return await this.authService.verifyToken(payload.token);
  }
}
