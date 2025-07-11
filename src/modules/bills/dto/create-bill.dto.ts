import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  ArrayMaxSize,
} from 'class-validator';
import { Priority, RecurringFrequency } from '@prisma/client';

export class CreateBillDto {
  @ApiProperty({
    example: 'Internet Service',
    description: 'Bill title',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Comcast',
    description: 'Company name',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  company: string;

  @ApiProperty({
    example: 89.99,
    description: 'Bill amount',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'USD',
    description: 'Bill currency',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiProperty({
    example: '2024-02-15T00:00:00Z',
    description: 'Due date',
  })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({
    example: 'Utilities',
    description: 'Bill category',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @ApiProperty({
    example: 'Monthly internet service for home office',
    description: 'Bill description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    enum: Priority,
    example: Priority.MEDIUM,
    description: 'Bill priority',
  })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({
    example: true,
    description: 'Is this a recurring bill',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    enum: RecurringFrequency,
    example: RecurringFrequency.MONTHLY,
    description: 'Recurring frequency',
    required: false,
  })
  @IsOptional()
  @IsEnum(RecurringFrequency)
  recurringFrequency?: RecurringFrequency;

  @ApiProperty({
    example: '2024-02-12T00:00:00Z',
    description: 'Reminder date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  reminderDate?: Date;

  @ApiProperty({
    example: true,
    description: 'Enable email notifications',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notificationEmail?: boolean;

  @ApiProperty({
    example: true,
    description: 'Enable push notifications',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notificationPush?: boolean;

  @ApiProperty({
    example: false,
    description: 'Enable SMS notifications',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notificationSms?: boolean;

  @ApiProperty({
    example: ['invoice-001.pdf', 'contract.pdf'],
    description: 'Attachment URLs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  attachments?: string[];
}
