import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Tech Distributors Inc.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sales@techdist.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1-555-1000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
