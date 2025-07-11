import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsString,
  IsIn,
  Min,
  IsObject,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    example: 5000,
    description: 'Monthly income amount',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncome?: number;

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

  @ApiProperty({
    example: 'dark',
    description: 'UI theme preference',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'auto'])
  theme?: string;

  @ApiProperty({
    example: {},
    description: 'Custom dashboard layout configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  dashboardLayout?: any;

  @ApiProperty({
    example: true,
    description: 'Enable gamification features',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  gamificationEnabled?: boolean;

  @ApiProperty({
    example: true,
    description: 'Enable AI assistant',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  aiAssistantEnabled?: boolean;

  @ApiProperty({
    example: 'professional',
    description: 'AI assistant personality',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['professional', 'friendly', 'motivational', 'educational'])
  aiPersonality?: string;
}
