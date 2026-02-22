import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}
