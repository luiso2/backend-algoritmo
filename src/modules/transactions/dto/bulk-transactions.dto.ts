import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';

export class BulkTransactionsDto {
  @ApiProperty({
    type: [CreateTransactionDto],
    description: 'Array of transactions to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  transactions: CreateTransactionDto[];
}
