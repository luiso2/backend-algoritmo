import { Module } from '@nestjs/common';
import { CreditCardsController } from './credit-cards.controller';
import { CreditCardsService } from './credit-cards.service';
import { PayCloseService } from './pay-close.service';

@Module({
  controllers: [CreditCardsController],
  providers: [CreditCardsService, PayCloseService],
  exports: [CreditCardsService, PayCloseService],
})
export class CreditCardsModule {}
