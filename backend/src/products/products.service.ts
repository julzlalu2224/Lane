import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existing) {
      throw new ConflictException('Product with this SKU already exists');
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: 'asc' },
    });

    return products.map((product) => ({
      ...product,
      isLowStock: product.stock < product.minStock,
    }));
  }

  async findLowStock() {
    const products = await this.prisma.product.findMany({
      where: {
        stock: {
          lt: this.prisma.product.fields.minStock,
        },
      },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { stock: 'asc' },
    });

    return products.map((product) => ({
      ...product,
      isLowStock: true,
      stockDeficit: product.minStock - product.stock,
    }));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        stockLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      ...product,
      isLowStock: product.stock < product.minStock,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    if (updateProductDto.sku) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async adjustStock(id: string, adjustStockDto: AdjustStockDto) {
    const product = await this.findOne(id);

    const newStock = product.stock + adjustStockDto.quantity;

    if (newStock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { stock: newStock },
        include: {
          category: true,
          supplier: true,
        },
      });

      await tx.stockLog.create({
        data: {
          productId: id,
          changeType: adjustStockDto.changeType,
          quantity: adjustStockDto.quantity,
          before: product.stock,
          after: newStock,
          notes: adjustStockDto.notes,
        },
      });

      return {
        ...updatedProduct,
        isLowStock: updatedProduct.stock < updatedProduct.minStock,
      };
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }
}
