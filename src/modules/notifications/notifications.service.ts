import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Notification, NotificationType, Prisma } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationPreferencesDto } from './dto/notification-preferences.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async create(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        ...createNotificationDto,
        read: false,
      },
    });

    // Add to queue for processing
    await this.notificationQueue.add('send-notification', {
      notificationId: notification.id,
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
    });

    return notification;
  }

  async findAll(
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      type?: NotificationType;
      read?: boolean;
    },
  ) {
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.read !== undefined) {
      where.read = params.read;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: params?.skip,
        take: params?.take || 50,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      total,
      skip: params?.skip || 0,
      take: params?.take || 50,
    };
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    await this.findOne(id, userId);

    return this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user || !user.settings) {
      return {
        emailAlerts: true,
        smsAlerts: false,
        pushAlerts: true,
      };
    }

    return {
      emailAlerts: user.settings.emailAlerts,
      smsAlerts: user.settings.smsAlerts,
      pushAlerts: user.settings.pushAlerts,
    };
  }

  async updatePreferences(
    userId: string,
    preferencesDto: NotificationPreferencesDto,
  ) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: preferencesDto,
      create: {
        userId,
        monthlyIncome: 0,
        ...preferencesDto,
      },
    });

    return {
      emailAlerts: settings.emailAlerts,
      smsAlerts: settings.smsAlerts,
      pushAlerts: settings.pushAlerts,
    };
  }

  // Helper methods for creating specific notification types
  async createReminderNotification(
    userId: string,
    title: string,
    message: string,
    data?: any,
  ) {
    return this.create(userId, {
      type: NotificationType.REMINDER,
      title,
      message,
      data,
    });
  }

  async createAlertNotification(
    userId: string,
    title: string,
    message: string,
    data?: any,
  ) {
    return this.create(userId, {
      type: NotificationType.ALERT,
      title,
      message,
      data,
    });
  }

  async createSuccessNotification(
    userId: string,
    title: string,
    message: string,
    data?: any,
  ) {
    return this.create(userId, {
      type: NotificationType.SUCCESS,
      title,
      message,
      data,
    });
  }
}
