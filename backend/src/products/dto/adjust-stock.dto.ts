import { IsInt, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StockChangeType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({ example: 10, description: 'Quantity to adjust (positive or negative)' })
  @IsInt()
  quantity: number;

  @ApiProperty({ enum: StockChangeType, example: StockChangeType.RESTOCK })
  @IsEnum(StockChangeType)
  changeType: StockChangeType;

  @ApiProperty({ example: 'Restocked from supplier', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
