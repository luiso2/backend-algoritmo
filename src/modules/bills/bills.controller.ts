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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { BillStatus } from '@prisma/client';

@ApiTags('bills')
@Controller('bills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createBillDto: CreateBillDto,
  ) {
    return this.billsService.create(userId, createBillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bills' })
  @ApiResponse({ status: 200, description: 'Bills retrieved successfully' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: BillStatus })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('status') status?: BillStatus,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.billsService.findAll(userId, {
      skip,
      take,
      status,
      category,
      priority,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get bills summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  getBillsSummary(@CurrentUser('id') userId: string) {
    return this.billsService.getBillsSummary(userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming bills' })
  @ApiResponse({ status: 200, description: 'Upcoming bills retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getUpcomingBills(
    @CurrentUser('id') userId: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    return this.billsService.getUpcomingBills(userId, days);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue bills' })
  @ApiResponse({ status: 200, description: 'Overdue bills retrieved successfully' })
  getOverdueBills(@CurrentUser('id') userId: string) {
    return this.billsService.getOverdueBills(userId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all bill categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories(@CurrentUser('id') userId: string) {
    return this.billsService.getCategories(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bill by ID' })
  @ApiResponse({ status: 200, description: 'Bill retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bill' })
  @ApiResponse({ status: 200, description: 'Bill updated successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateBillDto: UpdateBillDto,
  ) {
    return this.billsService.update(id, userId, updateBillDto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Mark bill as paid' })
  @ApiResponse({ status: 200, description: 'Bill marked as paid' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  payBill(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billsService.payBill(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete bill' })
  @ApiResponse({ status: 204, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billsService.remove(id, userId);
  }
}
