import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    // Validate all products exist and have sufficient stock
    for (const item of createSaleDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    // Use transaction to ensure data integrity
    return this.prisma.$transaction(async (tx) => {
      // Calculate totals and create sale items
      let totalAmount = 0;
      let totalProfit = 0;

      const saleItemsData = [];

      for (const item of createSaleDto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        const subtotal = product.price * item.quantity;
        const itemProfit = (product.price - product.cost) * item.quantity;

        totalAmount += subtotal;
        totalProfit += itemProfit;

        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          cost: product.cost,
          subtotal,
          profit: itemProfit,
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        // Create stock log
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            changeType: 'SALE',
            quantity: -item.quantity,
            before: product.stock,
            after: product.stock - item.quantity,
            notes: 'Sale transaction',
          },
        });
      }

      // Create the sale
      const sale = await tx.sale.create({
        data: {
          total: totalAmount,
          profit: totalProfit,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  supplier: true,
                },
              },
            },
          },
        },
      });

      return sale;
    });
  }

  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                supplier: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.sale.delete({
      where: { id },
    });

    return { message: 'Sale deleted successfully' };
  }
}
