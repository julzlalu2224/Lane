import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Daily revenue
    const dailySales = await this.prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
      _sum: {
        total: true,
        profit: true,
      },
      _count: true,
    });

    // Monthly revenue and profit
    const monthlySales = await this.prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
      _sum: {
        total: true,
        profit: true,
      },
      _count: true,
    });

    // Total products
    const totalProducts = await this.prisma.product.count();

    // Low stock products count
    const lowStockCount = await this.prisma.product.count({
      where: {
        stock: {
          lt: this.prisma.product.fields.minStock,
        },
      },
    });

    // Best selling products
    const bestSelling = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const bestSellingWithDetails = await Promise.all(
      bestSelling.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        });
        return {
          product,
          totalQuantity: item._sum.quantity,
          totalRevenue: item._sum.subtotal,
        };
      }),
    );

    // Recent sales
    const recentSales = await this.prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      daily: {
        revenue: dailySales._sum.total || 0,
        profit: dailySales._sum.profit || 0,
        sales: dailySales._count || 0,
      },
      monthly: {
        revenue: monthlySales._sum.total || 0,
        profit: monthlySales._sum.profit || 0,
        sales: monthlySales._count || 0,
      },
      inventory: {
        totalProducts,
        lowStockCount,
      },
      bestSelling: bestSellingWithDetails,
      recentSales,
    };
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totals = await this.prisma.sale.aggregate({
      where,
      _sum: {
        total: true,
        profit: true,
      },
      _count: true,
    });

    return {
      sales,
      summary: {
        totalSales: totals._count,
        totalRevenue: totals._sum.total || 0,
        totalProfit: totals._sum.profit || 0,
        averageOrderValue: totals._count > 0 ? (totals._sum.total || 0) / totals._count : 0,
      },
    };
  }

  async getInventoryReport() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { name: 'asc' },
    });

    const totalValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
    const totalRetailValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    return {
      products: products.map((p) => ({
        ...p,
        stockValue: p.cost * p.stock,
        retailValue: p.price * p.stock,
        isLowStock: p.stock < p.minStock,
      })),
      summary: {
        totalProducts: products.length,
        totalStockValue: totalValue,
        totalRetailValue: totalRetailValue,
        potentialProfit: totalRetailValue - totalValue,
      },
    };
  }

  async getProfitReport() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Get monthly profit for the last 12 months
    const monthlyData = [];

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 1);

      const sales = await this.prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonthDate,
          },
        },
        _sum: {
          total: true,
          profit: true,
        },
        _count: true,
      });

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: sales._sum.total || 0,
        profit: sales._sum.profit || 0,
        sales: sales._count || 0,
      });
    }

    return {
      monthlyData,
    };
  }
}
