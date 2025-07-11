import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreditCardsService } from './credit-cards.service';
import { PayCloseService } from './pay-close.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { PayCloseConfigDto } from './dto/pay-close-config.dto';
import { MakePaymentDto } from './dto/make-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('credit-cards')
@Controller('credit-cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreditCardsController {
  constructor(
    private readonly creditCardsService: CreditCardsService,
    private readonly payCloseService: PayCloseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credit card' })
  @ApiResponse({ status: 201, description: 'Credit card created successfully' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createCreditCardDto: CreateCreditCardDto,
  ) {
    return this.creditCardsService.create(userId, createCreditCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user credit cards' })
  @ApiResponse({ status: 200, description: 'Credit cards retrieved successfully' })
  findAll(@CurrentUser('id') userId: string) {
    return this.creditCardsService.findAll(userId);
  }

  @Get('utilization')
  @ApiOperation({ summary: 'Get credit utilization summary' })
  @ApiResponse({ status: 200, description: 'Utilization retrieved successfully' })
  getCreditUtilization(@CurrentUser('id') userId: string) {
    return this.creditCardsService.getCreditUtilization(userId);
  }

  @Get('pay-close-events')
  @ApiOperation({ summary: 'Get Pay Close events (closing and payment dates)' })
  @ApiResponse({ status: 200, description: 'Pay Close events retrieved successfully' })
  getPayCloseEvents(@CurrentUser('id') userId: string) {
    return this.payCloseService.getPayCloseEvents(userId);
  }

  @Get('pay-close-stats')
  @ApiOperation({ summary: 'Get Pay Close statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getPayCloseStats(@CurrentUser('id') userId: string) {
    return this.payCloseService.getPayCloseStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit card by ID' })
  @ApiResponse({ status: 200, description: 'Credit card retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Credit card not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.creditCardsService.findOne(id, userId);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get credit card transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  getCardTransactions(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.creditCardsService.getCardTransactions(id, userId, {
      skip,
      take,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id/pay-close-strategy')
  @ApiOperation({ summary: 'Get Pay Close strategy for a specific card' })
  @ApiResponse({ status: 200, description: 'Strategy retrieved successfully' })
  getPayCloseStrategy(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.payCloseService.getPayCloseStrategy(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update credit card' })
  @ApiResponse({ status: 200, description: 'Credit card updated successfully' })
  @ApiResponse({ status: 404, description: 'Credit card not found' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateCreditCardDto: UpdateCreditCardDto,
  ) {
    return this.creditCardsService.update(id, userId, updateCreditCardDto);
  }

  @Patch(':id/pay-close-config')
  @ApiOperation({ summary: 'Update Pay Close configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  updatePayCloseConfig(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() payCloseConfigDto: PayCloseConfigDto,
  ) {
    return this.creditCardsService.updatePayCloseConfig(id, userId, payCloseConfigDto);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Make a credit card payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  makePayment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() makePaymentDto: MakePaymentDto,
  ) {
    return this.creditCardsService.makePayment(id, userId, makePaymentDto.amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete credit card' })
  @ApiResponse({ status: 204, description: 'Credit card deleted successfully' })
  @ApiResponse({ status: 404, description: 'Credit card not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.creditCardsService.remove(id, userId);
  }
}
