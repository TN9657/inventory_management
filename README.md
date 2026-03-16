# Inventory Management System

A professional inventory management application for general stores with a modern UI built using React, TypeScript, Tailwind CSS, and Node.js with MySQL database.

## Features

- **Dashboard**: Analytics with daily, monthly, and yearly profit charts
- **Supplier Management**: Complete CRUD operations for suppliers
- **Material Management**: Add materials from suppliers with detailed tracking
- **Material Names**: Master data for all materials
- **Material List**: Inventory tracking with cost and selling prices
- **Billing System**: Customer billing with automatic inventory updates
- **Low Stock Alerts**: Automatic alerts for materials running low
- **Professional UI**: Clean, modern interface with black, white, grey, and blue color scheme

## Tech Stack

### Backend
- Node.js with Express
- MySQL database
- JWT authentication ready
- RESTful API design

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Recharts for analytics
- React Icons
- Responsive design

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Database Setup
1. Create a MySQL database named `inventory_management`
2. Update the `.env` file with your database credentials

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventory_management
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

## API Endpoints

### Suppliers
- GET `/api/suppliers` - Get all suppliers
- POST `/api/suppliers` - Create supplier
- PUT `/api/suppliers/:id` - Update supplier
- DELETE `/api/suppliers/:id` - Delete supplier

### Materials
- GET `/api/materials` - Get all material purchases
- POST `/api/materials` - Create material purchase
- GET `/api/materials/:id` - Get material details

### Material Names
- GET `/api/material-names` - Get all material names
- POST `/api/material-names` - Create material name

### Material List
- GET `/api/material-list` - Get inventory list
- PUT `/api/material-list/:id` - Update selling price

### Billing
- GET `/api/billing` - Get all bills
- POST `/api/billing` - Create new bill
- PUT `/api/billing/:id/payment` - Update payment

### Dashboard
- GET `/api/dashboard` - Get analytics data

## Database Schema

The application automatically creates the following tables:
- `suppliers` - Supplier information
- `material_names` - Master material names
- `materials` - Material purchases from suppliers
- `material_items` - Individual items in each purchase
- `material_list` - Current inventory with pricing
- `billing` - Customer bills
- `billing_items` - Items in each bill

## Features Implementation

### 1. Supplier Management
- Add supplier with GST, address, email, phone, company name
- Edit and delete suppliers
- Professional form with validation

### 2. Material Purchases
- Select supplier and add multiple materials
- Calculate per-item costs automatically
- Support for different units (kg, liters, packets, units)
- View detailed purchase history

### 3. Inventory Tracking
- Automatic quantity updates from purchases
- Manual selling price entry
- Profit calculations
- Low stock alerts

### 4. Billing System
- Customer billing with material selection
- Automatic inventory deduction
- Payment tracking
- Export capabilities (planned)

### 5. Dashboard Analytics
- Daily profit charts
- Monthly and yearly trends
- Lifetime profit tracking
- Low stock alerts

## Color Scheme

The application uses a professional color palette:
- Primary Blue: #3b82f6
- Greys: #f9fafb to #111827
- White backgrounds with subtle shadows
- Clean, modern design

## Future Enhancements

- PDF export for bills and reports
- Advanced reporting
- User authentication
- Barcode scanning
- Mobile app
- Multi-store support

## License

This project is licensed under the MIT License.