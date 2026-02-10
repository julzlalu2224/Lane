import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.stockLog.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@test.com',
      password: hashedPassword,
      name: 'Staff User',
      role: Role.STAFF,
    },
  });

  console.log('✅ Created users:', { admin: admin.email, staff: staff.email });

  // Create categories
  const electronics = await prisma.category.create({
    data: { name: 'Electronics' },
  });

  const furniture = await prisma.category.create({
    data: { name: 'Furniture' },
  });

  const supplies = await prisma.category.create({
    data: { name: 'Office Supplies' },
  });

  console.log('✅ Created categories');

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Tech Distributors Inc.',
      email: 'sales@techdist.com',
      phone: '+1-555-1000',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Furniture World',
      email: 'orders@furnitureworld.com',
      phone: '+1-555-2000',
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: 'Office Mart',
      email: 'info@officemart.com',
      phone: '+1-555-3000',
    },
  });

  console.log('✅ Created suppliers');

  // Create products
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        sku: 'ELEC-001',
        price: 29.99,
        cost: 15.0,
        stock: 50,
        minStock: 10,
        categoryId: electronics.id,
        supplierId: supplier1.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Keyboard',
        sku: 'ELEC-002',
        price: 89.99,
        cost: 45.0,
        stock: 30,
        minStock: 5,
        categoryId: electronics.id,
        supplierId: supplier1.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub',
        sku: 'ELEC-003',
        price: 49.99,
        cost: 25.0,
        stock: 25,
        minStock: 10,
        categoryId: electronics.id,
        supplierId: supplier1.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Webcam HD',
        sku: 'ELEC-004',
        price: 79.99,
        cost: 40.0,
        stock: 8,
        minStock: 10,
        categoryId: electronics.id,
        supplierId: supplier1.id,
      },
    }),
    // Furniture
    prisma.product.create({
      data: {
        name: 'Office Chair',
        sku: 'FURN-001',
        price: 199.99,
        cost: 100.0,
        stock: 15,
        minStock: 5,
        categoryId: furniture.id,
        supplierId: supplier2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Standing Desk',
        sku: 'FURN-002',
        price: 399.99,
        cost: 200.0,
        stock: 10,
        minStock: 3,
        categoryId: furniture.id,
        supplierId: supplier2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Desk Lamp',
        sku: 'FURN-003',
        price: 39.99,
        cost: 20.0,
        stock: 40,
        minStock: 10,
        categoryId: furniture.id,
        supplierId: supplier2.id,
      },
    }),
    // Office Supplies
    prisma.product.create({
      data: {
        name: 'Notebook Set',
        sku: 'SUPP-001',
        price: 12.99,
        cost: 6.0,
        stock: 100,
        minStock: 20,
        categoryId: supplies.id,
        supplierId: supplier3.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pen Pack (12pcs)',
        sku: 'SUPP-002',
        price: 8.99,
        cost: 4.0,
        stock: 150,
        minStock: 30,
        categoryId: supplies.id,
        supplierId: supplier3.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sticky Notes',
        sku: 'SUPP-003',
        price: 5.99,
        cost: 2.5,
        stock: 200,
        minStock: 50,
        categoryId: supplies.id,
        supplierId: supplier3.id,
      },
    }),
  ]);

  console.log('✅ Created products');

  // Create some sample sales
  const sale1Products = [products[0], products[7], products[8]];
  const sale1Items = sale1Products.map((product) => ({
    productId: product.id,
    quantity: 2,
    price: product.price,
    cost: product.cost,
    subtotal: product.price * 2,
    profit: (product.price - product.cost) * 2,
  }));

  const sale1Total = sale1Items.reduce((sum, item) => sum + item.subtotal, 0);
  const sale1Profit = sale1Items.reduce((sum, item) => sum + item.profit, 0);

  const sale1 = await prisma.sale.create({
    data: {
      total: sale1Total,
      profit: sale1Profit,
      items: {
        create: sale1Items,
      },
    },
  });

  // Update stock and create logs for sale 1
  for (const item of sale1Items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    
    if (product) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: product.stock - item.quantity },
      });

      await prisma.stockLog.create({
        data: {
          productId: item.productId,
          changeType: 'SALE',
          quantity: -item.quantity,
          before: product.stock,
          after: product.stock - item.quantity,
          notes: `Sale #${sale1.id.substring(0, 8)}`,
        },
      });
    }
  }

  console.log('✅ Created sample sale 1');

  // Create another sale
  const sale2Products = [products[1], products[4]];
  const sale2Items = sale2Products.map((product) => ({
    productId: product.id,
    quantity: 1,
    price: product.price,
    cost: product.cost,
    subtotal: product.price * 1,
    profit: (product.price - product.cost) * 1,
  }));

  const sale2Total = sale2Items.reduce((sum, item) => sum + item.subtotal, 0);
  const sale2Profit = sale2Items.reduce((sum, item) => sum + item.profit, 0);

  const sale2 = await prisma.sale.create({
    data: {
      total: sale2Total,
      profit: sale2Profit,
      items: {
        create: sale2Items,
      },
    },
  });

  // Update stock and create logs for sale 2
  for (const item of sale2Items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    
    if (product) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: product.stock - item.quantity },
      });

      await prisma.stockLog.create({
        data: {
          productId: item.productId,
          changeType: 'SALE',
          quantity: -item.quantity,
          before: product.stock,
          after: product.stock - item.quantity,
          notes: `Sale #${sale2.id.substring(0, 8)}`,
        },
      });
    }
  }

  console.log('✅ Created sample sale 2');

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
