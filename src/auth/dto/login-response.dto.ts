export interface AuthUserDto {
  email: string;
  name: string;
  userId: string;
}

export interface LoginResponseDto {
  pass: boolean;
  user: AuthUserDto;
  token?: string;
}
