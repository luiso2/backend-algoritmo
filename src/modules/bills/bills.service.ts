import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Bill, Prisma, BillStatus } from '@prisma/client';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBillDto: CreateBillDto): Promise<Bill> {
    const dueDate = createBillDto.dueDate || new Date();
    
    // Calculate reminder date if not provided
    let reminderDate = createBillDto.reminderDate;
    if (!reminderDate && createBillDto.notificationEmail || createBillDto.notificationPush || createBillDto.notificationSms) {
      reminderDate = dayjs(dueDate).subtract(3, 'days').toDate();
    }

    const { title, company, description, amount, currency, category, priority, isRecurring, recurringFrequency, notificationEmail, notificationPush, notificationSms, attachments } = createBillDto;
    
    return this.prisma.bill.create({
      data: {
        userId,
        name: title,
        company,
        description,
        amount,
        currency: currency || 'USD',
        dueDate,
        reminderDate,
        category,
        priority: priority || 'MEDIUM',
        isRecurring: isRecurring || false,
        recurringFrequency,
        status: 'PENDING',
        notificationEmail: notificationEmail !== undefined ? notificationEmail : true,
        notificationPush: notificationPush !== undefined ? notificationPush : true,
        notificationSms: notificationSms !== undefined ? notificationSms : false,
        attachments: attachments || [],
        notes: null,
      },
    });
  }

  async findAll(
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      status?: BillStatus;
      category?: string;
      priority?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
  ) {
    const where: Prisma.BillWhereInput = {
      userId,
    };

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.priority) {
      where.priority = params.priority as any;
    }

    if (params?.startDate || params?.endDate) {
      where.dueDate = {};
      if (params.startDate) {
        where.dueDate.gte = params.startDate;
      }
      if (params.endDate) {
        where.dueDate.lte = params.endDate;
      }
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { company: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [bills, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip: params?.skip,
        take: params?.take || 50,
        orderBy: {
          dueDate: 'asc',
        },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data: bills,
      total,
      skip: params?.skip || 0,
      take: params?.take || 50,
    };
  }

  async findOne(id: string, userId: string): Promise<Bill> {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: {
            date: 'desc',
          },
          take: 10,
        },
        reminders: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.userId !== userId) {
      throw new ForbiddenException('You do not have access to this bill');
    }

    return bill;
  }

  async update(
    id: string,
    userId: string,
    updateBillDto: UpdateBillDto,
  ): Promise<Bill> {
    await this.findOne(id, userId);

    return this.prisma.bill.update({
      where: { id },
      data: updateBillDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    // Check if there are related transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { billId: id },
    });

    if (transactionCount > 0) {
      // Just mark as cancelled if there are transactions
      await this.prisma.bill.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    } else {
      // Hard delete if no transactions
      await this.prisma.bill.delete({
        where: { id },
      });
    }
  }

  async payBill(id: string, userId: string): Promise<Bill> {
    const bill = await this.findOne(id, userId);

    if (bill.status === 'PAID') {
      throw new BadRequestException('Bill is already paid');
    }

    // Update bill status
    const updatedBill = await this.prisma.bill.update({
      where: { id },
      data: { status: 'PAID' },
    });

    // Create payment transaction
    await this.prisma.transaction.create({
      data: {
        userId,
        description: `Payment - ${bill.title}`,
        amount: bill.amount,
        currency: bill.currency,
        date: new Date(),
        type: 'EXPENSE',
        category: bill.category,
        paymentMethod: 'TRANSFER',
        billId: id,
      },
    });

    // If recurring, create next bill
    if (bill.isRecurring && bill.recurringFrequency) {
      const nextDueDate = this.calculateNextDueDate(bill.dueDate, bill.recurringFrequency);
      
      await this.create(userId, {
        title: bill.title,
        company: bill.company,
        amount: Number(bill.amount),
        currency: bill.currency,
        dueDate: nextDueDate,
        category: bill.category,
        description: bill.description,
        priority: bill.priority,
        isRecurring: bill.isRecurring,
        recurringFrequency: bill.recurringFrequency,
        notificationEmail: bill.notificationEmail,
        notificationPush: bill.notificationPush,
        notificationSms: bill.notificationSms,
      });
    }

    return updatedBill;
  }

  async getUpcomingBills(userId: string, days: number = 7) {
    const endDate = dayjs().add(days, 'day').endOf('day').toDate();

    return this.prisma.bill.findMany({
      where: {
        userId,
        status: 'PENDING',
        dueDate: {
          lte: endDate,
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async getOverdueBills(userId: string) {
    const today = dayjs().startOf('day').toDate();

    const bills = await this.prisma.bill.findMany({
      where: {
        userId,
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Update status to overdue
    const billIds = bills.map(b => b.id);
    if (billIds.length > 0) {
      await this.prisma.bill.updateMany({
        where: {
          id: { in: billIds },
        },
        data: {
          status: 'OVERDUE',
        },
      });
    }

    return bills.map(bill => ({
      ...bill,
      status: 'OVERDUE' as BillStatus,
      daysOverdue: dayjs().diff(dayjs(bill.dueDate), 'day'),
    }));
  }

  async getBillsSummary(userId: string) {
    const [pending, paid, overdue, upcoming] = await Promise.all([
      // Total pending
      this.prisma.bill.aggregate({
        where: {
          userId,
          status: 'PENDING',
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      
      // Total paid this month
      this.prisma.bill.aggregate({
        where: {
          userId,
          status: 'PAID',
          updatedAt: {
            gte: dayjs().startOf('month').toDate(),
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      
      // Total overdue
      this.prisma.bill.aggregate({
        where: {
          userId,
          status: 'OVERDUE',
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      
      // Upcoming (next 7 days)
      this.getUpcomingBills(userId, 7),
    ]);

    return {
      pending: {
        count: pending._count._all,
        total: Number(pending._sum.amount) || 0,
      },
      paid: {
        count: paid._count._all,
        total: Number(paid._sum.amount) || 0,
      },
      overdue: {
        count: overdue._count._all,
        total: Number(overdue._sum.amount) || 0,
      },
      upcoming: {
        count: upcoming.length,
        total: upcoming.reduce((sum, bill) => sum + Number(bill.amount), 0),
        bills: upcoming,
      },
    };
  }

  async getCategories(userId: string): Promise<string[]> {
    const categories = await this.prisma.bill.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map(c => c.category);
  }

  // Scheduled job to check overdue bills
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueBills() {
    const today = dayjs().startOf('day').toDate();

    await this.prisma.bill.updateMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      data: {
        status: 'OVERDUE',
      },
    });
  }

  private calculateNextDueDate(currentDueDate: Date, frequency: any): Date {
    const current = dayjs(currentDueDate);
    
    switch (frequency) {
      case 'DAILY':
        return current.add(1, 'day').toDate();
      case 'WEEKLY':
        return current.add(1, 'week').toDate();
      case 'BIWEEKLY':
        return current.add(2, 'week').toDate();
      case 'MONTHLY':
        return current.add(1, 'month').toDate();
      case 'QUARTERLY':
        return current.add(3, 'month').toDate();
      case 'YEARLY':
        return current.add(1, 'year').toDate();
      default:
        return current.add(1, 'month').toDate();
    }
  }
}
