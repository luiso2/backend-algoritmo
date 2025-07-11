import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AccountsModule } from '../accounts/accounts.module';
import { CreditCardsModule } from '../credit-cards/credit-cards.module';

@Module({
  imports: [AccountsModule, CreditCardsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
