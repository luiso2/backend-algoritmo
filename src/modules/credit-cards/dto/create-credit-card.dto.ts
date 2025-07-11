import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsHexColor,
  Matches,
} from 'class-validator';

export class CreateCreditCardDto {
  @ApiProperty({
    example: 'Visa Gold',
    description: 'Credit card name',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Bank of America',
    description: 'Bank name',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  bank: string;

  @ApiProperty({
    example: '1234',
    description: 'Last four digits of card number',
  })
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'Last four digits must be exactly 4 numbers',
  })
  last4Digits: string;

  @ApiProperty({
    example: 5000,
    description: 'Credit limit',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  creditLimit: number;

  @ApiProperty({
    example: 1200,
    description: 'Current balance',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;

  @ApiProperty({
    example: 120,
    description: 'Minimum payment amount',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumPayment?: number;

  @ApiProperty({
    example: 'Visa',
    description: 'Card brand',
  })
  @IsString()
  brand: string;

  @ApiProperty({
    example: 5,
    description: 'Statement closing day (1-31)',
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  closingDay: number;

  @ApiProperty({
    example: 15,
    description: 'Payment due day (1-31)',
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiProperty({
    example: '#7CB342',
    description: 'Card color for UI',
  })
  @IsHexColor()
  color: string;

  @ApiProperty({
    example: true,
    description: 'Enable closing date reminder',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  reminderClosing?: boolean;

  @ApiProperty({
    example: true,
    description: 'Enable payment date reminder',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  reminderPayment?: boolean;

  @ApiProperty({
    example: 3,
    description: 'Days before closing to send reminder',
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  daysBeforeClosing?: number;

  @ApiProperty({
    example: 5,
    description: 'Days before payment to send reminder',
    required: false,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  daysBeforePayment?: number;


}
