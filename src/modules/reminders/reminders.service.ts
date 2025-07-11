import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Reminder, Prisma, ReminderType } from '@prisma/client';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReminderDto: CreateReminderDto): Promise<Reminder> {
    const { type, title, description, date, dueDate, cardId, billId, amount } = createReminderDto;
    return this.prisma.reminder.create({
      data: {
        userId,
        type,
        title,
        description,
        date,
        dueDate: dueDate || date,
        creditCardId: cardId,
        billId,
        amount,
        notificationSent: false,
      },
    });
  }

  async findAll(
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      type?: ReminderType;
      sent?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const where: Prisma.ReminderWhereInput = {
      userId,
    };

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.sent !== undefined) {
      where.notificationSent = params.sent;
    }

    if (params?.startDate || params?.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = params.startDate;
      }
      if (params.endDate) {
        where.date.lte = params.endDate;
      }
    }

    const [reminders, total] = await Promise.all([
      this.prisma.reminder.findMany({
        where,
        skip: params?.skip,
        take: params?.take || 50,
        orderBy: {
          date: 'asc',
        },
        include: {
          creditCard: {
            select: {
              name: true,
              bank: true,
            },
          },
          bill: {
            select: {
              title: true,
              company: true,
            },
          },
        },
      }),
      this.prisma.reminder.count({ where }),
    ]);

    return {
      data: reminders,
      total,
      skip: params?.skip || 0,
      take: params?.take || 50,
    };
  }

  async findOne(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
      include: {
        creditCard: true,
        bill: true,
      },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenException('You do not have access to this reminder');
    }

    return reminder;
  }

  async update(
    id: string,
    userId: string,
    updateReminderDto: UpdateReminderDto,
  ): Promise<Reminder> {
    await this.findOne(id, userId);

    return this.prisma.reminder.update({
      where: { id },
      data: updateReminderDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.reminder.delete({
      where: { id },
    });
  }

  async markAsSent(id: string, userId: string): Promise<Reminder> {
    await this.findOne(id, userId);

    return this.prisma.reminder.update({
      where: { id },
      data: {
        notificationSent: true,
        sentAt: new Date(),
      },
    });
  }

  async getUpcoming(userId: string, days: number = 7) {
    const endDate = dayjs().add(days, 'day').endOf('day').toDate();

    return this.prisma.reminder.findMany({
      where: {
        userId,
        notificationSent: false,
        date: {
          lte: endDate,
          gte: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        creditCard: {
          select: {
            name: true,
            bank: true,
          },
        },
        bill: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });
  }

  // Generate reminders for credit cards
  async generateCreditCardReminders() {
    const creditCards = await this.prisma.creditCard.findMany({
      where: {
        isActive: true,
        OR: [
          { reminderClosing: true },
          { reminderPayment: true },
        ],
      },
    });

    const today = dayjs();
    const remindersToCreate: Prisma.ReminderCreateManyInput[] = [];

    for (const card of creditCards) {
      // Closing date reminder
      if (card.reminderClosing && card.closingDate) {
        const closingDate = this.getNextDate(card.closingDate);
        const reminderDate = closingDate.subtract(card.daysBeforeClosing, 'day');
        
        if (reminderDate.isAfter(today) && reminderDate.isBefore(today.add(30, 'day'))) {
          const existingReminder = await this.prisma.reminder.findFirst({
            where: {
              userId: card.userId,
              cardId: card.id,
              type: 'CLOSING',
              date: {
                gte: reminderDate.startOf('day').toDate(),
                lte: reminderDate.endOf('day').toDate(),
              },
            },
          });

          if (!existingReminder) {
            remindersToCreate.push({
              userId: card.userId,
              type: 'CLOSING',
              title: `Cierre de ${card.name}`,
              description: `Tu tarjeta ${card.name} cierra en ${card.daysBeforeClosing} días`,
              date: reminderDate.toDate(),
              dueDate: closingDate.toDate(),
              creditCardId: card.id,
              notificationSent: false,
            });
          }
        }
      }

      // Payment date reminder
      if (card.reminderPayment && card.dueDate) {
        const dueDate = this.getNextDate(card.dueDate);
        const reminderDate = dueDate.subtract(card.daysBeforePayment, 'day');
        
        if (reminderDate.isAfter(today) && reminderDate.isBefore(today.add(30, 'day'))) {
          const existingReminder = await this.prisma.reminder.findFirst({
            where: {
              userId: card.userId,
              cardId: card.id,
              type: 'PAYMENT',
              date: {
                gte: reminderDate.startOf('day').toDate(),
                lte: reminderDate.endOf('day').toDate(),
              },
            },
          });

          if (!existingReminder) {
            remindersToCreate.push({
              userId: card.userId,
              type: 'PAYMENT',
              title: `Pago de ${card.name}`,
              description: `Tu tarjeta ${card.name} vence en ${card.daysBeforePayment} días`,
              date: reminderDate.toDate(),
              dueDate: dueDate.toDate(),
              creditCardId: card.id,
              amount: card.minimumPayment,
              notificationSent: false,
            });
          }
        }
      }
    }

    if (remindersToCreate.length > 0) {
      await this.prisma.reminder.createMany({
        data: remindersToCreate,
      });
    }

    return remindersToCreate.length;
  }

  // Generate reminders for bills
  async generateBillReminders() {
    const bills = await this.prisma.bill.findMany({
      where: {
        status: 'PENDING',
        reminderDate: {
          not: null,
        },
        OR: [
          { notificationEmail: true },
          { notificationPush: true },
          { notificationSms: true },
        ],
      },
    });

    const today = dayjs();
    const remindersToCreate: Prisma.ReminderCreateManyInput[] = [];

    for (const bill of bills) {
      if (bill.reminderDate && dayjs(bill.reminderDate).isAfter(today)) {
        const existingReminder = await this.prisma.reminder.findFirst({
          where: {
            userId: bill.userId,
            billId: bill.id,
            type: 'BILL',
            date: {
              gte: dayjs(bill.reminderDate).startOf('day').toDate(),
              lte: dayjs(bill.reminderDate).endOf('day').toDate(),
            },
          },
        });

        if (!existingReminder) {
          remindersToCreate.push({
            userId: bill.userId,
            type: 'BILL',
            title: `Pagar ${bill.name}`,
            description: `Recordatorio para pagar ${bill.name}`,
            date: bill.reminderDate,
            dueDate: bill.dueDate,
            billId: bill.id,
            amount: bill.amount,
            notificationSent: false,
          });
        }
      }
    }

    if (remindersToCreate.length > 0) {
      await this.prisma.reminder.createMany({
        data: remindersToCreate,
      });
    }

    return remindersToCreate.length;
  }

  // Scheduled job to generate reminders
  @Cron('0 0 * * *') // Every day at midnight
  async generateDailyReminders() {
    const [creditCardReminders, billReminders] = await Promise.all([
      this.generateCreditCardReminders(),
      this.generateBillReminders(),
    ]);

    console.log(`Generated ${creditCardReminders} credit card reminders and ${billReminders} bill reminders`);
  }

  // Scheduled job to send reminders
  @Cron('0 9 * * *') // Every day at 9 AM
  async sendDueReminders() {
    const today = dayjs();
    const reminders = await this.prisma.reminder.findMany({
      where: {
        notificationSent: false,
        date: {
          gte: today.startOf('day').toDate(),
          lte: today.endOf('day').toDate(),
        },
      },
      include: {
        user: true,
        creditCard: true,
        bill: true,
      },
    });

    for (const reminder of reminders) {
      try {
        // TODO: Send actual notifications via email/push/SMS
        // await this.notificationsService.send(reminder);

        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            notificationSent: true,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
      }
    }

    return reminders.length;
  }

  private getNextDate(dayOfMonth: number): dayjs.Dayjs {
    const today = dayjs();
    let nextDate = today.date(dayOfMonth);

    // Check if the day exists in the current month
    if (nextDate.date() !== dayOfMonth) {
      // If not, use the last day of the month
      nextDate = today.endOf('month');
    }

    // If the date has passed, go to next month
    if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
      nextDate = nextDate.add(1, 'month').date(dayOfMonth);
      // Check again for next month
      if (nextDate.date() !== dayOfMonth) {
        nextDate = nextDate.endOf('month');
      }
    }

    return nextDate;
  }
}
