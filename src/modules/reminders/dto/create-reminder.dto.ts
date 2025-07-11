import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ReminderType } from '@prisma/client';

export class CreateReminderDto {
  @ApiProperty({
    enum: ReminderType,
    example: ReminderType.PAYMENT,
    description: 'Reminder type',
  })
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({
    example: 'Credit Card Payment Due',
    description: 'Reminder title',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Your Visa Gold payment is due in 3 days',
    description: 'Reminder description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: '2024-02-15T09:00:00Z',
    description: 'Reminder date and time',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    example: '2024-02-18T09:00:00Z',
    description: 'Due date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Related credit card ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  cardId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Related bill ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  billId?: string;

  @ApiProperty({
    example: 150.00,
    description: 'Amount related to reminder',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;
}
