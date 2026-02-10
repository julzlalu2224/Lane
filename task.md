You are a senior full-stack SaaS engineer.

Build a production-ready MVP called: Lane

Smart Inventory + Sales System (Mini ERP)

This is a portfolio-quality system for small businesses to manage inventory, suppliers, sales, and reports.

🎯 Tech Stack (MANDATORY)

Frontend:

React 18 + TypeScript

Vite

Tailwind CSS

React Hook Form

TanStack React Query

Zustand

Recharts

Lucide icons

Backend:

NestJS (Node + TypeScript)

Prisma ORM

PostgreSQL (Supabase)

JWT authentication with bcrypt

Swagger API docs

Role-based access control (Admin, Staff)

DevOps:

Docker Compose (local dev)

Render (backend hosting)

Vercel (frontend hosting)

Supabase (Postgres database)

🧠 Architecture

Frontend (Vercel)
→ Backend API (Render)
→ PostgreSQL (Supabase)

Prisma must connect to Supabase via DATABASE_URL.

Migrations must be compatible with:

npx prisma migrate deploy

🔐 Authentication

JWT + refresh tokens.

Roles:

ADMIN

STAFF

Protected routes.

🧩 Core Features
Users

Login

Register

Role management

Products

Fields:

id
name
sku
price
cost
stock
minStock
categoryId
supplierId
createdAt


CRUD.

Low-stock warning if stock < minStock.

Categories

Simple CRUD.

Suppliers
id
name
email
phone


CRUD.

Sales

Create sale with multiple products:

sales
sale_items


Each sale must:

Deduct stock

Calculate total

Store profit

Use Prisma transaction.

Inventory Logs

Every stock change stored in:

stock_logs

Reports

Dashboard:

Daily revenue

Monthly profit

Best selling products

SQL aggregation via Prisma.

Charts using Recharts.

🗄 Database Schema

Tables:

users
products
categories
suppliers
sales
sale_items
stock_logs


Proper foreign keys.

Indexes on:

product_id

sale_id

created_at

🏗 Backend Structure (Nest)

Modules:

auth
users
products
categories
suppliers
sales
reports
prisma


Each module:

controller

service

dto

entity

Swagger enabled.

Validation via class-validator.

🖥 Frontend Structure

Pages:

Login

Dashboard

Products

Sales

Suppliers

Reports

Components:

Tables

Modals

Forms

Charts

React Query for API.

Axios client.

JWT stored in httpOnly cookies.

🔒 Security

bcrypt hashing

JWT guards

role guards

input validation

CORS

Prisma SQL injection protection

📦 Local Dev

Docker compose:

postgres

backend

frontend

🚀 Deployment Instructions MUST be included
Frontend

Deploy to Vercel.

Backend

Deploy to Render.

Include:

Build:

npm install && npx prisma generate


Start:

npm run start:prod

Database

Supabase Postgres.

Use DATABASE_URL env.

Explain that migrations are run on Render:

npx prisma migrate deploy

📁 Final Output

Generate:

Full Prisma schema

NestJS backend

React frontend

Docker compose

README with setup + deployment

Sample env files

Seed script with demo users

Demo users:

Admin:
admin@test.com
 / password123

Staff:
staff@test.com
 / password123

🧪 Bonus (if time)

CSV export

Pagination

Search filters

IMPORTANT

Code must be production quality.

No placeholders.

No mock APIs.

Everything must be wired.

Explain setup step-by-step.