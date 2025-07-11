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
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ReminderType } from '@prisma/client';

@ApiTags('reminders')
@Controller('reminders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    return this.remindersService.create(userId, createReminderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders' })
  @ApiResponse({ status: 200, description: 'Reminders retrieved successfully' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReminderType })
  @ApiQuery({ name: 'sent', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('type') type?: ReminderType,
    @Query('sent') sent?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.remindersService.findAll(userId, {
      skip,
      take,
      type,
      sent: sent === 'true' ? true : sent === 'false' ? false : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming reminders' })
  @ApiResponse({ status: 200, description: 'Upcoming reminders retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getUpcoming(
    @CurrentUser('id') userId: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    return this.remindersService.getUpcoming(userId, days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID' })
  @ApiResponse({ status: 200, description: 'Reminder retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder' })
  @ApiResponse({ status: 200, description: 'Reminder updated successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, userId, updateReminderDto);
  }

  @Post(':id/mark-sent')
  @ApiOperation({ summary: 'Mark reminder as sent' })
  @ApiResponse({ status: 200, description: 'Reminder marked as sent' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  markAsSent(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.markAsSent(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete reminder' })
  @ApiResponse({ status: 204, description: 'Reminder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.remove(id, userId);
  }
}
