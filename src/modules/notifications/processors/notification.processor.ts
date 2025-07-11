import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { PushService } from '../services/push.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notifications')
export class NotificationProcessor {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    private prisma: PrismaService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job) {
    const { notificationId, userId, type, title, message } = job.data;

    try {
      // Get user preferences
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { settings: true },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const settings = user.settings || {
        emailAlerts: true,
        smsAlerts: false,
        pushAlerts: true,
      };

      const results = {
        email: false,
        sms: false,
        push: false,
      };

      // Send email if enabled
      if (settings.emailAlerts && user.email) {
        try {
          await this.emailService.sendReminderEmail(
            user.email,
            title,
            message,
          );
          results.email = true;
        } catch (error) {
          console.error('Error sending email:', error);
        }
      }

      // Send SMS if enabled
      if (settings.smsAlerts && user.phone) {
        try {
          await this.smsService.sendReminderSms(
            user.phone,
            title,
            message,
          );
          results.sms = true;
        } catch (error) {
          console.error('Error sending SMS:', error);
        }
      }

      // Send push notification if enabled
      if (settings.pushAlerts) {
        try {
          await this.pushService.sendPushNotification(
            userId,
            title,
            message,
          );
          results.push = true;
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }

      console.log(`Notification ${notificationId} sent:`, results);
      return results;
    } catch (error) {
      console.error('Error processing notification:', error);
      throw error;
    }
  }

  @Process('send-bulk-notifications')
  async handleSendBulkNotifications(job: Job) {
    const { userIds, title, message, type } = job.data;

    const results = {
      total: userIds.length,
      successful: 0,
      failed: 0,
    };

    for (const userId of userIds) {
      try {
        await this.handleSendNotification({
          data: {
            userId,
            type,
            title,
            message,
          },
        } as Job);
        results.successful++;
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        results.failed++;
      }
    }

    return results;
  }
}
