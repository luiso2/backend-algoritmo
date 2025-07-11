import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
  ArrayMaxSize,
} from 'class-validator';
import { TransactionType, PaymentMethod } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({
    example: 'Grocery shopping at Walmart',
    description: 'Transaction description',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description: string;

  @ApiProperty({
    example: 150.50,
    description: 'Transaction amount',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'USD',
    description: 'Transaction currency',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Transaction date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Transaction type',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    example: 'Food & Groceries',
    description: 'Transaction category',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT,
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Account ID (for debit/cash transactions)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Credit card ID (for credit transactions)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  creditCardId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Bill ID (if related to a bill payment)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  billId?: string;

  @ApiProperty({
    example: ['groceries', 'weekly-shopping'],
    description: 'Transaction tags',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];

  @ApiProperty({
    example: 'Bought groceries for the week',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    example: false,
    description: 'Is this a recurring transaction',
    required: false,
  })
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({
    example: { frequency: 'monthly', dayOfMonth: 15 },
    description: 'Recurring configuration',
    required: false,
  })
  @IsOptional()
  recurringConfig?: any;

  @ApiProperty({
    example: ['receipt-001.jpg', 'invoice-001.pdf'],
    description: 'Attachment URLs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  attachments?: string[];
}
