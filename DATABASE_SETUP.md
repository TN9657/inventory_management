# Database Setup Instructions

## Quick Setup

### 1. Update Environment Variables
Edit the `.env` file in the root directory with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=inventory_management
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Initialize Database (Automatic)
The database will be automatically created when you start the server:
```bash
npm run dev
```

### 4. Manual Database Setup (Optional)
If you want to set up the database manually:

```bash
# Run the setup script
npm run setup-db
```

Or execute the SQL file directly in MySQL:
```bash
mysql -u root -p < ../database_setup.sql
```

## Database Structure

### Tables Created:
1. **suppliers** - Store supplier information
2. **material_names** - Master list of all materials
3. **materials** - Purchase records from suppliers
4. **material_items** - Individual items in each purchase
5. **material_list** - Current inventory with pricing
6. **billing** - Customer billing records
7. **billing_items** - Items in each bill

### Sample Data Included:
- 3 sample suppliers
- 10 sample materials (Rice, Wheat, Sugar, etc.)
- Sample purchase records
- Sample inventory data
- Sample billing records

## Verification

After setup, you can verify the database by connecting to MySQL:

```sql
USE inventory_management;
SHOW TABLES;
SELECT COUNT(*) FROM suppliers;
SELECT COUNT(*) FROM material_names;
```

You should see:
- 7 tables created
- 3 suppliers
- 10 material names
- Sample data in all tables

## Troubleshooting

1. **Connection Error**: Check MySQL is running and credentials are correct
2. **Permission Error**: Ensure MySQL user has CREATE DATABASE privileges
3. **Port Error**: Verify MySQL is running on the specified port (default 3306)

The system will automatically create all tables and relationships with proper foreign keys and indexes for optimal performance.