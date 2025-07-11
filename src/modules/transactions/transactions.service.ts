import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, Prisma, TransactionType } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { BulkTransactionsDto } from './dto/bulk-transactions.dto';
import { AccountsService } from '../accounts/accounts.service';
import { CreditCardsService } from '../credit-cards/credit-cards.service';
import * as dayjs from 'dayjs';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private accountsService: AccountsService,
    private creditCardsService: CreditCardsService,
  ) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Validate and sanitize input
    const sanitizedData = this.sanitizeTransactionData(createTransactionDto);
    
    // Validate account or credit card ownership
    if (sanitizedData.accountId) {
      await this.accountsService.findOne(sanitizedData.accountId, userId);
    }
    
    if (sanitizedData.creditCardId) {
      await this.creditCardsService.findOne(sanitizedData.creditCardId, userId);
    }

    // Start transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          ...sanitizedData,
          userId,
          date: sanitizedData.date || new Date(),
        },
      });

      // Update account balance if applicable
      if (sanitizedData.accountId && sanitizedData.paymentMethod !== 'CREDIT') {
        const amount = Number(transaction.amount);
        const operation = transaction.type === 'INCOME' ? 'add' : 'subtract';
        
        await this.updateAccountBalance(
          tx,
          sanitizedData.accountId,
          amount,
          operation,
        );
      }

      // Update credit card balance if applicable
      if (sanitizedData.creditCardId && sanitizedData.paymentMethod === 'CREDIT' && transaction.type === 'EXPENSE') {
        await this.updateCreditCardBalance(
          tx,
          sanitizedData.creditCardId,
          Number(transaction.amount),
          'add',
        );
      }

      return transaction;
    });
  }

  async createBulk(
    userId: string,
    bulkTransactionsDto: BulkTransactionsDto,
  ): Promise<{ created: number; failed: number; errors: any[] }> {
    const results = {
      created: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const transactionData of bulkTransactionsDto.transactions) {
      try {
        await this.create(userId, transactionData);
        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          transaction: transactionData,
          error: error.message,
        });
      }
    }

    return results;
  }

  async findAll(
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      type?: TransactionType;
      category?: string;
      accountId?: string;
      creditCardId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    // Apply filters
    if (params?.type) {
      where.type = params.type;
    }

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.accountId) {
      where.accountId = params.accountId;
    }

    if (params?.creditCardId) {
      where.creditCardId = params.creditCardId;
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

    if (params?.search) {
      where.description = {
        contains: params.search,
        mode: 'insensitive',
      };
    }

    // Determine sort order
    const orderBy: Prisma.TransactionOrderByWithRelationInput = {};
    const sortField = params?.sortBy || 'date';
    const sortOrder = params?.sortOrder || 'desc';
    orderBy[sortField] = sortOrder;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: params?.skip,
        take: params?.take || 50,
        orderBy,
        include: {
          account: {
            select: {
              name: true,
              currency: true,
            },
          },
          creditCard: {
            select: {
              name: true,
              lastFourDigits: true,
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
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      total,
      skip: params?.skip || 0,
      take: params?.take || 50,
    };
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: true,
        creditCard: true,
        bill: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('You do not have access to this transaction');
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const originalTransaction = await this.findOne(id, userId);

    // Validate new account or credit card if changed
    if (updateTransactionDto.accountId && updateTransactionDto.accountId !== originalTransaction.accountId) {
      await this.accountsService.findOne(updateTransactionDto.accountId, userId);
    }

    if (updateTransactionDto.creditCardId && updateTransactionDto.creditCardId !== originalTransaction.creditCardId) {
      await this.creditCardsService.findOne(updateTransactionDto.creditCardId, userId);
    }

    const sanitizedData = this.sanitizeTransactionData(updateTransactionDto);

    return await this.prisma.$transaction(async (tx) => {
      // Revert original transaction effects
      await this.revertTransactionEffects(tx, originalTransaction);

      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: sanitizedData,
      });

      // Apply new transaction effects
      await this.applyTransactionEffects(tx, updatedTransaction);

      return updatedTransaction;
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);

    await this.prisma.$transaction(async (tx) => {
      // Revert transaction effects
      await this.revertTransactionEffects(tx, transaction);

      // Delete transaction
      await tx.transaction.delete({
        where: { id },
      });
    });
  }

  async getStatsByCategory(
    userId: string,
    params?: {
      startDate?: Date;
      endDate?: Date;
      type?: TransactionType;
    },
  ) {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (params?.type) {
      where.type = params.type;
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

    const transactions = await this.prisma.transaction.groupBy({
      by: ['category', 'type'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    return transactions.map(item => ({
      category: item.category,
      type: item.type,
      total: Number(item._sum.amount) || 0,
      count: item._count._all,
    }));
  }

  async getMonthlyStats(userId: string, year: number, month: number) {
    const startDate = dayjs()
      .year(year)
      .month(month - 1)
      .startOf('month')
      .toDate();
    
    const endDate = dayjs()
      .year(year)
      .month(month - 1)
      .endOf('month')
      .toDate();

    const [income, expenses, byCategory, dailyTrend] = await Promise.all([
      // Total income
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Total expenses
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      
      // By category
      this.getStatsByCategory(userId, { startDate, endDate }),
      
      // Daily trend
      this.getDailyTrend(userId, startDate, endDate),
    ]);

    return {
      month,
      year,
      income: Number(income._sum.amount) || 0,
      expenses: Number(expenses._sum.amount) || 0,
      balance: (Number(income._sum.amount) || 0) - (Number(expenses._sum.amount) || 0),
      byCategory,
      dailyTrend,
    };
  }

  async getCategories(userId: string): Promise<string[]> {
    const categories = await this.prisma.transaction.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map(c => c.category);
  }

  async exportTransactions(
    userId: string,
    format: 'csv' | 'json',
    params?: {
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<string> {
    const transactions = await this.findAll(userId, {
      startDate: params?.startDate,
      endDate: params?.endDate,
      take: 10000, // Max export limit
    });

    if (format === 'json') {
      return JSON.stringify(transactions.data, null, 2);
    }

    // CSV format
    const headers = [
      'Date',
      'Description',
      'Type',
      'Category',
      'Amount',
      'Currency',
      'Payment Method',
      'Account',
      'Credit Card',
      'Notes',
    ];

    const rows = transactions.data.map(t => [
      dayjs(t.date).format('YYYY-MM-DD'),
      t.description,
      t.type,
      t.category,
      t.amount.toString(),
      t.currency,
      t.paymentMethod,
      t.account?.name || '',
      t.creditCard?.name || '',
      t.notes || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  private sanitizeTransactionData(data: any): any {
    return {
      ...data,
      description: data.description?.trim().substring(0, 255),
      amount: Math.abs(Number(data.amount) || 0),
      notes: data.notes?.trim().substring(0, 1000),
      tags: data.tags?.filter((tag: string) => tag.trim().length > 0),
    };
  }

  private async updateAccountBalance(
    tx: any,
    accountId: string,
    amount: number,
    operation: 'add' | 'subtract',
  ) {
    const account = await tx.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const currentBalance = Number(account.balance);
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount;

    await tx.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    });
  }

  private async updateCreditCardBalance(
    tx: any,
    creditCardId: string,
    amount: number,
    operation: 'add' | 'subtract',
  ) {
    const card = await tx.creditCard.findUnique({
      where: { id: creditCardId },
    });

    if (!card) {
      throw new NotFoundException('Credit card not found');
    }

    const currentBalance = Number(card.balance);
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount;

    await tx.creditCard.update({
      where: { id: creditCardId },
      data: { balance: Math.max(0, newBalance) },
    });
  }

  private async revertTransactionEffects(tx: any, transaction: Transaction) {
    // Revert account balance
    if (transaction.accountId && transaction.paymentMethod !== 'CREDIT') {
      const amount = Number(transaction.amount);
      const operation = transaction.type === 'INCOME' ? 'subtract' : 'add';
      await this.updateAccountBalance(tx, transaction.accountId, amount, operation);
    }

    // Revert credit card balance
    if (transaction.creditCardId && transaction.paymentMethod === 'CREDIT' && transaction.type === 'EXPENSE') {
      await this.updateCreditCardBalance(
        tx,
        transaction.creditCardId,
        Number(transaction.amount),
        'subtract',
      );
    }
  }

  private async applyTransactionEffects(tx: any, transaction: Transaction) {
    // Apply to account balance
    if (transaction.accountId && transaction.paymentMethod !== 'CREDIT') {
      const amount = Number(transaction.amount);
      const operation = transaction.type === 'INCOME' ? 'add' : 'subtract';
      await this.updateAccountBalance(tx, transaction.accountId, amount, operation);
    }

    // Apply to credit card balance
    if (transaction.creditCardId && transaction.paymentMethod === 'CREDIT' && transaction.type === 'EXPENSE') {
      await this.updateCreditCardBalance(
        tx,
        transaction.creditCardId,
        Number(transaction.amount),
        'add',
      );
    }
  }

  private async getDailyTrend(userId: string, startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by date
    const dailyData: Record<string, { income: number; expenses: number }> = {};
    
    transactions.forEach(t => {
      const dateKey = dayjs(t.date).format('YYYY-MM-DD');
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { income: 0, expenses: 0 };
      }
      
      if (t.type === 'INCOME') {
        dailyData[dateKey].income += Number(t.amount);
      } else {
        dailyData[dateKey].expenses += Number(t.amount);
      }
    });

    // Convert to array
    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses,
    }));
  }
}
