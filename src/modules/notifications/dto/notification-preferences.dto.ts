import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationPreferencesDto {
  @ApiProperty({
    example: true,
    description: 'Enable email alerts',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailAlerts?: boolean;

  @ApiProperty({
    example: false,
    description: 'Enable SMS alerts',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  smsAlerts?: boolean;

  @ApiProperty({
    example: true,
    description: 'Enable push notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  pushAlerts?: boolean;
}
