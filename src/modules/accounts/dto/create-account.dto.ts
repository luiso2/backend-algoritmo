import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  IsHexColor,
} from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Main Checking Account',
    description: 'Account name',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: AccountType,
    example: AccountType.CHECKING,
    description: 'Type of account',
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    example: 'USD',
    description: 'Account currency',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiProperty({
    example: 1500.50,
    description: 'Initial balance',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;

  @ApiProperty({
    example: 'Bank of America',
    description: 'Bank name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({
    example: '****1234',
    description: 'Account number (last 4 digits)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  accountNumber?: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Account color for UI',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({
    example: 'bank',
    description: 'Icon identifier',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the account is active',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
