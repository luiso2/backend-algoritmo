import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditCard } from '@prisma/client';
import * as dayjs from 'dayjs';

export interface PayCloseEvent {
  id: string;
  cardId: string;
  cardName: string;
  cardBank: string;
  cardColor: string;
  type: 'closing' | 'payment';
  date: string;
  daysUntil: number;
  amount?: number;
  notificationEnabled: boolean;
  notificationDaysBefore: number;
}

export interface PayCloseStrategy {
  nextClosingDate: Date;
  nextDueDate: Date;
  daysUntilClosing: number;
  daysUntilDue: number;
  currentPhase: 'grace' | 'billing';
  paymentDeadlineForZeroUtil: Date;
  daysUntilPaymentDeadline: number;
  safeUsageStartDate: Date;
  nextPaymentAmount: number;
  optimizeCredit: {
    shouldPayNow: boolean;
    paymentDate: Date;
    stopUsageDate: Date;
    resumeUsageDate: Date;
  };
  businessStrategy?: {
    canUseFreely: boolean;
    maxFinancingDays: number;
    noInterestUntil: Date;
    noCreditReporting: boolean;
  };
  recommendations: Array<{
    type: 'urgent' | 'optimal' | 'info';
    message: string;
    action: string;
  }>;
}

@Injectable()
export class PayCloseService {
  constructor(private prisma: PrismaService) {}

  async getPayCloseEvents(userId: string): Promise<PayCloseEvent[]> {
    const cards = await this.prisma.creditCard.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const events: PayCloseEvent[] = [];
    const today = dayjs();

    cards.forEach(card => {
      if (card.closingDate) {
        const closingDate = this.getNextDate(card.closingDate);
        const closingDays = closingDate.diff(today, 'day');
        
        events.push({
          id: `${card.id}-closing`,
          cardId: card.id,
          cardName: card.name,
          cardBank: card.bank,
          cardColor: card.color,
          type: 'closing',
          date: closingDate.format('YYYY-MM-DD'),
          daysUntil: closingDays,
          notificationEnabled: card.reminderClosing,
          notificationDaysBefore: card.daysBeforeClosing,
        });
      }

      if (card.dueDate) {
        const dueDate = this.getNextDate(card.dueDate);
        const dueDays = dueDate.diff(today, 'day');
        
        events.push({
          id: `${card.id}-payment`,
          cardId: card.id,
          cardName: card.name,
          cardBank: card.bank,
          cardColor: card.color,
          type: 'payment',
          date: dueDate.format('YYYY-MM-DD'),
          daysUntil: dueDays,
          amount: Number(card.minimumPayment),
          notificationEnabled: card.reminderPayment,
          notificationDaysBefore: card.daysBeforePayment,
        });
      }
    });

    return events.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  async getPayCloseStrategy(
    cardId: string,
    userId: string,
  ): Promise<PayCloseStrategy | null> {
    const card = await this.prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card || !card.closingDate || !card.dueDate) {
      return null;
    }

    const today = dayjs();
    const nextClosing = this.getNextDate(card.closingDate);
    const nextDue = this.getNextDate(card.dueDate);
    const daysUntilClosing = nextClosing.diff(today, 'day');
    const daysUntilDue = nextDue.diff(today, 'day');

    // Determine current phase
    const lastClosing = nextClosing.subtract(1, 'month');
    const isInGracePeriod = today.isAfter(lastClosing) && today.isBefore(nextDue);
    const currentPhase = isInGracePeriod ? 'grace' : 'billing';

    // Calculate optimal payment date for 0% utilization
    const paymentDeadlineForZeroUtil = nextClosing.subtract(1, 'day');
    const daysUntilPaymentDeadline = paymentDeadlineForZeroUtil.diff(today, 'day');
    const safeUsageStartDate = nextClosing.add(1, 'day');

    // Check if it's a business card
    const isBusinessCard = this.isBusinessCard(card);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      daysUntilClosing,
      daysUntilDue,
      Number(card.balance),
      isBusinessCard,
      isInGracePeriod,
    );

    const strategy: PayCloseStrategy = {
      nextClosingDate: nextClosing.toDate(),
      nextDueDate: nextDue.toDate(),
      daysUntilClosing,
      daysUntilDue,
      currentPhase,
      paymentDeadlineForZeroUtil: paymentDeadlineForZeroUtil.toDate(),
      daysUntilPaymentDeadline,
      safeUsageStartDate: safeUsageStartDate.toDate(),
      nextPaymentAmount: isInGracePeriod ? Number(card.balance) : 0,
      optimizeCredit: {
        shouldPayNow: daysUntilClosing <= 3 && Number(card.balance) > 0,
        paymentDate: paymentDeadlineForZeroUtil.toDate(),
        stopUsageDate: paymentDeadlineForZeroUtil.toDate(),
        resumeUsageDate: safeUsageStartDate.toDate(),
      },
      recommendations,
    };

    if (isBusinessCard) {
      strategy.businessStrategy = {
        canUseFreely: !isInGracePeriod,
        maxFinancingDays: 60,
        noInterestUntil: nextDue.add(30, 'day').toDate(),
        noCreditReporting: true,
      };
    }

    return strategy;
  }

  async getPayCloseStats(userId: string) {
    const events = await this.getPayCloseEvents(userId);
    const cards = await this.prisma.creditCard.findMany({
      where: { userId, isActive: true },
    });
    
    const urgentEvents = events.filter(e => e.daysUntil <= 2);
    const upcomingEvents = events.filter(e => e.daysUntil <= 7);
    const configuredCards = cards.filter(c => c.closingDate && c.dueDate);

    return {
      totalEvents: events.length,
      urgentEvents: urgentEvents.length,
      upcomingEvents: upcomingEvents.length,
      configuredCards: configuredCards.length,
      totalCards: cards.length,
      configurationRate: cards.length > 0 
        ? (configuredCards.length / cards.length) * 100 
        : 0,
    };
  }

  private getNextDate(dayOfMonth: number): dayjs.Dayjs {
    const today = dayjs();
    let nextDate = today.date(dayOfMonth);

    // Check if the day exists in the current month
    if (nextDate.date() !== dayOfMonth) {
      // If not, use the last day of the month
      nextDate = today.endOf('month');
    }

    // If the date has passed or is today, go to next month
    if (nextDate.isBefore(today) || nextDate.isSame(today, 'day')) {
      nextDate = nextDate.add(1, 'month').date(dayOfMonth);
      // Check again for next month
      if (nextDate.date() !== dayOfMonth) {
        nextDate = nextDate.endOf('month');
      }
    }

    return nextDate;
  }

  private isBusinessCard(card: CreditCard): boolean {
    const businessIndicators = [
      'business',
      'negocio',
      'corporate',
      'commercial',
      'ink',
      'amex business',
    ];

    const cardNameLower = card.name.toLowerCase();
    const bankNameLower = card.bank.toLowerCase();

    return businessIndicators.some(
      indicator => 
        cardNameLower.includes(indicator) || 
        bankNameLower.includes(indicator)
    );
  }

  private generateRecommendations(
    daysUntilClosing: number,
    daysUntilDue: number,
    balance: number,
    isBusiness: boolean,
    inGrace: boolean,
  ): Array<{ type: 'urgent' | 'optimal' | 'info'; message: string; action: string }> {
    const recommendations: Array<{ type: 'urgent' | 'optimal' | 'info'; message: string; action: string }> = [];

    // Urgent recommendations
    if (daysUntilClosing <= 1 && balance > 0) {
      recommendations.push({
        type: 'urgent',
        message: '🚨 Tu tarjeta cierra en menos de 24 horas',
        action: 'Paga todo HOY para reportar 0% de utilización',
      });
    }

    if (daysUntilDue <= 2 && inGrace) {
      recommendations.push({
        type: 'urgent',
        message: '⚠️ Tu fecha de pago está muy cerca',
        action: 'Paga lo que quedó pendiente del último cierre',
      });
    }

    // Optimal recommendations
    if (daysUntilClosing >= 2 && daysUntilClosing <= 5 && balance > 0) {
      recommendations.push({
        type: 'optimal',
        message: '💡 Momento perfecto para optimizar tu crédito',
        action: `Paga todo en ${daysUntilClosing - 1} días y deja de usar la tarjeta`,
      });
    }

    if (daysUntilClosing >= 1 && balance === 0) {
      recommendations.push({
        type: 'optimal',
        message: '✅ Perfecto! Tu tarjeta reportará 0% de utilización',
        action: 'Puedes usar la tarjeta libremente después del cierre',
      });
    }

    // Business card recommendations
    if (isBusiness && !inGrace) {
      recommendations.push({
        type: 'info',
        message: '💼 Tarjeta de negocio: Sin reporte a buró',
        action: 'Aprovecha hasta 60 días de financiamiento sin intereses',
      });
    }

    return recommendations;
  }
}
