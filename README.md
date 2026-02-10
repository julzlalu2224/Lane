# Lane - Smart Inventory + Sales System

A production-ready MVP for managing inventory, suppliers, sales, and reports. Built as a portfolio-quality full-stack SaaS application.

## 🎯 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **TanStack React Query** for data fetching
- **Zustand** for state management
- **Recharts** for data visualization
- **Lucide** icons

### Backend
- **NestJS** (Node.js + TypeScript)
- **Prisma ORM** for database management
- **PostgreSQL** database
- **JWT** authentication with bcrypt
- **Swagger** API documentation
- **Role-based access control** (Admin, Staff)

### DevOps
- **Docker Compose** for local development
- **Render** for backend hosting
- **Vercel** for frontend hosting
- **Supabase** for PostgreSQL database

## 🏗 Architecture

```
Frontend (Vercel)
    ↓
Backend API (Render)
    ↓
PostgreSQL (Supabase)
```

## 🚀 Features

### Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Staff)
- Protected routes

### Products Management
- Full CRUD operations
- Low-stock warnings
- SKU management
- Category and supplier associations
- Stock adjustments with audit logs

### Categories & Suppliers
- Simple CRUD operations
- Product count tracking

### Sales
- Multi-item sales
- Automatic stock deduction
- Profit calculation
- Transaction history
- Prisma transactions for data integrity

### Reports & Analytics
- Dashboard with key metrics
- Daily and monthly revenue tracking
- Profit analysis
- Best selling products
- Inventory valuation
- Monthly profit trends (charts)

### Inventory Logs
- Automatic logging of all stock changes
- Track sales, adjustments, restocks, returns

## 📦 Local Development Setup

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Lane
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# DATABASE_URL, JWT_SECRET, etc.

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npm run prisma:seed

# Start the backend
npm run start:dev
```

Backend will be available at `http://localhost:3000`
Swagger API docs at `http://localhost:3000/api`

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:3000

# Install dependencies
npm install

# Start the frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Docker Compose (Alternative - Full Stack)

```bash
# From the root directory
docker-compose up -d

# This will start:
# - PostgreSQL on port 5432
# - Backend on port 3000
# - Frontend on port 5173
```

## 👤 Demo Accounts

After seeding, you can use these accounts:

**Admin:**
- Email: `admin@test.com`
- Password: `password123`

**Staff:**
- Email: `staff@test.com`
- Password: `password123`

## 🌐 Deployment

### Database (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your database connection string
3. Update `DATABASE_URL` in your environment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm run start:prod`
   - **Environment:** Node
4. Add environment variables:
   ```
   DATABASE_URL=<your-supabase-connection-string>
   JWT_SECRET=<strong-random-secret>
   JWT_REFRESH_SECRET=<strong-random-secret>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Deploy!
6. After first deploy, run migrations:
   ```bash
   # In Render shell or locally with production DATABASE_URL
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Frontend (Vercel)

1. Import your repository on [Vercel](https://vercel.com)
2. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Deploy!

### Post-Deployment

1. Update `FRONTEND_URL` in your backend environment variables
2. Test authentication and API endpoints
3. Create your first admin user if needed

## 📚 API Documentation

Once the backend is running, visit `/api` for Swagger documentation:
- Local: `http://localhost:3000/api`
- Production: `https://your-backend.onrender.com/api`

### Key Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token

**Products:**
- `GET /products` - List all products
- `GET /products/low-stock` - Get low stock products
- `POST /products` - Create product (Admin)
- `PATCH /products/:id` - Update product (Admin)
- `PATCH /products/:id/adjust-stock` - Adjust stock (Admin)
- `DELETE /products/:id` - Delete product (Admin)

**Categories:**
- `GET /categories` - List all categories
- `POST /categories` - Create category (Admin)
- `PATCH /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

**Suppliers:**
- `GET /suppliers` - List all suppliers
- `POST /suppliers` - Create supplier (Admin)
- `PATCH /suppliers/:id` - Update supplier (Admin)
- `DELETE /suppliers/:id` - Delete supplier (Admin)

**Sales:**
- `GET /sales` - List all sales
- `GET /sales/:id` - Get sale details
- `POST /sales` - Create new sale
- `DELETE /sales/:id` - Delete sale (Admin)

**Reports:**
- `GET /reports/dashboard` - Dashboard statistics
- `GET /reports/sales` - Sales report
- `GET /reports/inventory` - Inventory report
- `GET /reports/profit` - Profit trends

## 🔒 Security Features

- **bcrypt** password hashing
- **JWT** with short-lived access tokens and long-lived refresh tokens
- **Role-based guards** for authorization
- **Input validation** using class-validator
- **CORS** protection
- **Prisma** SQL injection protection
- **HTTP-only cookies** support (can be enabled)

## 📁 Project Structure

```
Lane/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # Users module
│   │   ├── products/          # Products module
│   │   ├── categories/        # Categories module
│   │   ├── suppliers/         # Suppliers module
│   │   ├── sales/             # Sales module
│   │   ├── reports/           # Reports module
│   │   ├── prisma/            # Prisma service
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Bootstrap
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Zustand store
│   │   ├── lib/               # API client
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main app
│   │   └── main.tsx           # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

### Backend
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend
```bash
cd frontend
npm run lint
```

## 📈 Database Schema

### Users
- Authentication and authorization
- Role: ADMIN or STAFF

### Categories
- Product categorization

### Suppliers
- Supplier information
- Contact details

### Products
- Complete product information
- Stock tracking
- Pricing (cost + retail)
- Low stock alerts

### Sales
- Sale transactions
- Total and profit tracking

### SaleItems
- Individual items in a sale
- Quantity and pricing at time of sale

### StockLogs
- Audit trail for stock changes
- Types: SALE, ADJUSTMENT, RESTOCK, RETURN

## 🔧 Development Scripts

### Backend
```bash
npm run start         # Start
npm run start:dev     # Development with watch
npm run start:prod    # Production
npm run build         # Build
npm run lint          # Lint
npm run test          # Test
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint
```

## 🤝 Contributing

This is a portfolio project. Feel free to fork and customize for your own use!

## 📝 License

MIT

## 🙏 Acknowledgments

Built with modern best practices for a production-ready SaaS application.