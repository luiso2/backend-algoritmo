import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.REMINDER,
    description: 'Notification type',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    example: 'Payment Reminder',
    description: 'Notification title',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Your credit card payment is due tomorrow',
    description: 'Notification message',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    example: { cardId: '123', amount: 150.00 },
    description: 'Additional data',
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: any;
}
