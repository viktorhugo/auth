import { AuthUserDto } from './login-response.dto';

export interface RegisterResponseDto {
  user: AuthUserDto;
  token: string;
}
