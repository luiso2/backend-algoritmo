import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditCard, Prisma } from '@prisma/client';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { PayCloseConfigDto } from './dto/pay-close-config.dto';

@Injectable()
export class CreditCardsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createCreditCardDto: CreateCreditCardDto,
  ): Promise<CreditCard> {
    const { last4Digits, creditLimit, closingDay, dueDay, ...rest } = createCreditCardDto;
    return this.prisma.creditCard.create({
      data: {
        ...rest,
        userId,
        last4Digits,
        creditLimit,
        availableLimit: creditLimit,
        closingDay,
        dueDay,
        balance: createCreditCardDto.balance || 0,
        minimumPayment: createCreditCardDto.minimumPayment || 0,
      },
    });
  }

  async findAll(userId: string): Promise<CreditCard[]> {
    return this.prisma.creditCard.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<CreditCard> {
    const card = await this.prisma.creditCard.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this credit card');
    }

    return card;
  }

  async update(
    id: string,
    userId: string,
    updateCreditCardDto: UpdateCreditCardDto,
  ): Promise<CreditCard> {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.creditCard.update({
      where: { id },
      data: updateCreditCardDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verify ownership
    await this.findOne(id, userId);

    // Check if there are transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { creditCardId: id },
    });

    if (transactionCount > 0) {
      // Soft delete - just mark as inactive
      await this.prisma.creditCard.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no transactions
      await this.prisma.creditCard.delete({
        where: { id },
      });
    }
  }

  async makePayment(
    id: string,
    userId: string,
    amount: number,
  ): Promise<CreditCard> {
    const card = await this.findOne(id, userId);
    const currentBalance = Number(card.balance);
    const newBalance = Math.max(0, currentBalance - amount);

    // Update card balance
    const updatedCard = await this.prisma.creditCard.update({
      where: { id },
      data: { balance: newBalance },
    });

    // Create payment transaction
    await this.prisma.transaction.create({
      data: {
        userId,
        description: `Payment - ${card.name}`,
        amount,
        currency: 'USD', // TODO: Get from user settings
        date: new Date(),
        type: 'EXPENSE',
        category: 'Credit Card Payment',
        paymentMethod: 'TRANSFER',
      },
    });

    return updatedCard;
  }

  async updatePayCloseConfig(
    id: string,
    userId: string,
    config: PayCloseConfigDto,
  ): Promise<CreditCard> {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.creditCard.update({
      where: { id },
      data: {
        closingDate: config.closingDate,
        dueDate: config.dueDate,
        reminderClosing: config.reminders.closing,
        reminderPayment: config.reminders.payment,
        daysBeforeClosing: config.reminders.daysBeforeClosing,
        daysBeforePayment: config.reminders.daysBeforePayment,
      },
    });
  }

  async getCreditUtilization(userId: string): Promise<{
    totalLimit: number;
    totalBalance: number;
    utilizationPercentage: number;
    cards: Array<{
      id: string;
      name: string;
      limit: number;
      balance: number;
      utilization: number;
    }>;
  }> {
    const cards = await this.findAll(userId);
    
    let totalLimit = 0;
    let totalBalance = 0;
    
    const cardUtilization = cards.map(card => {
      const limit = Number(card.creditLimit);
      const balance = Number(card.balance);
      
      totalLimit += limit;
      totalBalance += balance;
      
      return {
        id: card.id,
        name: card.name,
        limit,
        balance,
        utilization: limit > 0 ? (balance / limit) * 100 : 0,
      };
    });

    return {
      totalLimit,
      totalBalance,
      utilizationPercentage: totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0,
      cards: cardUtilization,
    };
  }

  async getCardTransactions(
    cardId: string,
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    // Verify ownership
    await this.findOne(cardId, userId);

    const where: Prisma.TransactionWhereInput = {
      creditCardId: cardId,
    };

    if (params?.startDate || params?.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = params.startDate;
      }
      if (params.endDate) {
        where.date.lte = params.endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: params?.skip,
        take: params?.take || 50,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      total,
      skip: params?.skip || 0,
      take: params?.take || 50,
    };
  }
}
