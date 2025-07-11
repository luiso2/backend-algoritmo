import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...data,
          settings: {
            create: {
              monthlyIncome: 0,
              emailAlerts: true,
              pushAlerts: true,
            },
          },
          roles: {
            create: {
              role: {
                connect: {
                  name: 'free', // Default role
                },
              },
            },
          },
        },
        include: {
          settings: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User with this email already exists');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        settings: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
        _count: {
          select: {
            accounts: true,
            creditCards: true,
            transactions: true,
            goals: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        settings: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        include: {
          settings: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
      }
      throw error;
    }
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    const user = await this.findOne(userId);

    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: updateSettingsDto,
      create: {
        userId,
        monthlyIncome: 0,
        ...updateSettingsDto,
      },
    });

    return settings;
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findOne(id);

    // Use transaction to delete all related data
    await this.prisma.$transaction(async (tx) => {
      // Delete all related data
      await tx.transaction.deleteMany({ where: { userId: id } });
      await tx.creditCard.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.bill.deleteMany({ where: { userId: id } });
      await tx.reminder.deleteMany({ where: { userId: id } });
      await tx.contract.deleteMany({ where: { userId: id } });
      await tx.goal.deleteMany({ where: { userId: id } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.userAchievement.deleteMany({ where: { userId: id } });
      await tx.subscription.deleteMany({ where: { userId: id } });
      await tx.fileUpload.deleteMany({ where: { userId: id } });
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.userSettings.deleteMany({ where: { userId: id } });
      
      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }

  async getUserStats(userId: string) {
    const user = await this.findOne(userId);

    const [
      totalAccounts,
      totalCreditCards,
      totalTransactions,
      monthlyIncome,
      monthlyExpenses,
      totalGoals,
      completedGoals,
      achievements,
    ] = await Promise.all([
      this.prisma.account.count({ where: { userId } }),
      this.prisma.creditCard.count({ where: { userId } }),
      this.prisma.transaction.count({ where: { userId } }),
      this.getMonthlyIncome(userId),
      this.getMonthlyExpenses(userId),
      this.prisma.goal.count({ where: { userId } }),
      this.prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.userAchievement.count({ where: { userId } }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        language: user.language,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      stats: {
        totalAccounts,
        totalCreditCards,
        totalTransactions,
        monthlyIncome,
        monthlyExpenses,
        netIncome: monthlyIncome - monthlyExpenses,
        totalGoals,
        completedGoals,
        goalsCompletionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        achievements,
        level: (user as any).settings?.currentLevel || 1,
        totalPoints: (user as any).settings?.totalPoints || 0,
      },
    };
  }

  private async getMonthlyIncome(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount) || 0;
  }

  private async getMonthlyExpenses(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount) || 0;
  }
}
