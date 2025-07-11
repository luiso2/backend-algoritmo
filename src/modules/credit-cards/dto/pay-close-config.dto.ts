import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsBoolean,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class RemindersConfigDto {
  @ApiProperty({
    example: true,
    description: 'Enable closing date reminder',
  })
  @IsBoolean()
  closing: boolean;

  @ApiProperty({
    example: true,
    description: 'Enable payment date reminder',
  })
  @IsBoolean()
  payment: boolean;

  @ApiProperty({
    example: 3,
    description: 'Days before closing to send reminder',
  })
  @IsNumber()
  @Min(1)
  @Max(30)
  daysBeforeClosing: number;

  @ApiProperty({
    example: 5,
    description: 'Days before payment to send reminder',
  })
  @IsNumber()
  @Min(1)
  @Max(30)
  daysBeforePayment: number;
}

class NotificationsConfigDto {
  @ApiProperty({
    example: true,
    description: 'Enable email notifications',
  })
  @IsBoolean()
  email: boolean;

  @ApiProperty({
    example: true,
    description: 'Enable push notifications',
  })
  @IsBoolean()
  push: boolean;

  @ApiProperty({
    example: false,
    description: 'Enable SMS notifications',
  })
  @IsBoolean()
  sms: boolean;
}

export class PayCloseConfigDto {
  @ApiProperty({
    example: 5,
    description: 'Statement closing day (1-31)',
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  closingDate: number;

  @ApiProperty({
    example: 15,
    description: 'Payment due day (1-31)',
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDate: number;

  @ApiProperty({
    type: RemindersConfigDto,
    description: 'Reminder configuration',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RemindersConfigDto)
  reminders: RemindersConfigDto;

  @ApiProperty({
    type: NotificationsConfigDto,
    description: 'Notification channel configuration',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationsConfigDto)
  notifications: NotificationsConfigDto;
}
