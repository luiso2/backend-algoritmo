import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Prisma } from '@prisma/client';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAccountDto: CreateAccountDto): Promise<Account> {
    const { name, type, currency, balance, bankName, accountNumber, color, icon, isActive } = createAccountDto;
    return this.prisma.account.create({
      data: {
        userId,
        name,
        type,
        currency: currency || 'USD',
        balance: balance || 0,
        initialBalance: balance || 0,
        bankName,
        accountNumber,
        color,
        icon,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
  }

  async findAll(userId: string): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.userId !== userId) {
      throw new ForbiddenException('You do not have access to this account');
    }

    return account;
  }

  async update(
    id: string,
    userId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verify ownership
    const account = await this.findOne(id, userId);

    // Check if there are transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { accountId: id },
    });

    if (transactionCount > 0) {
      // Soft delete - just mark as inactive
      await this.prisma.account.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no transactions
      await this.prisma.account.delete({
        where: { id },
      });
    }
  }

  async getAccountSummary(userId: string) {
    const accounts = await this.findAll(userId);
    
    const summary = {
      totalAccounts: accounts.length,
      totalBalance: 0,
      balancesByCurrency: {} as Record<string, number>,
      balancesByType: {
        CHECKING: 0,
        SAVINGS: 0,
        INVESTMENT: 0,
      },
    };

    for (const account of accounts) {
      const balance = Number(account.balance);
      
      // Total balance (converted to user's default currency)
      // TODO: Implement currency conversion
      summary.totalBalance += balance;

      // Balance by currency
      if (!summary.balancesByCurrency[account.currency]) {
        summary.balancesByCurrency[account.currency] = 0;
      }
      summary.balancesByCurrency[account.currency] += balance;

      // Balance by type
      summary.balancesByType[account.type] += balance;
    }

    return summary;
  }

  async getAccountTransactions(
    accountId: string,
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    // Verify ownership
    await this.findOne(accountId, userId);

    const where: Prisma.TransactionWhereInput = {
      accountId,
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
        include: {
          creditCard: {
            select: {
              name: true,
              lastFourDigits: true,
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

  async updateBalance(
    accountId: string,
    amount: number,
    operation: 'add' | 'subtract',
  ): Promise<Account> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const currentBalance = Number(account.balance);
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount;

    return this.prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    });
  }
}
