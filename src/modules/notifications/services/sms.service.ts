import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async sendSms(to: string, message: string) {
    if (!this.twilioClient) {
      console.warn('Twilio client not configured');
      return;
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
      });

      console.log(`SMS sent to ${to}: ${result.sid}`);
      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendReminderSms(to: string, reminderTitle: string, reminderMessage: string) {
    const message = `Algoritmo Finanzas - ${reminderTitle}\n\n${reminderMessage}`;
    
    // SMS has character limits, so truncate if necessary
    const truncatedMessage = message.length > 160 
      ? message.substring(0, 157) + '...' 
      : message;

    await this.sendSms(to, truncatedMessage);
  }

  async sendVerificationCode(to: string, code: string) {
    const message = `Algoritmo Finanzas - Tu código de verificación es: ${code}. Válido por 10 minutos.`;
    await this.sendSms(to, message);
  }
}
