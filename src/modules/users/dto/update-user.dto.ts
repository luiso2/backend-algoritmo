import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phone?: string;

  @ApiProperty({
    example: 'es',
    description: 'User preferred language',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['es', 'en', 'pt', 'fr'])
  language?: string;

  @ApiProperty({
    example: 'USD',
    description: 'User preferred currency',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'BRL', 'MXN', 'ARS', 'COP'])
  currency?: string;

  @ApiProperty({
    example: 'America/New_York',
    description: 'User timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    example: 'NewSecureP@ssw0rd',
    description: 'New password',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password?: string;
}
