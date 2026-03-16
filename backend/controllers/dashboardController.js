const { getConnection } = require('../config/database');

const getDashboardData = async (req, res) => {
  try {
    const connection = getConnection();
    
    // Today's profit
    const [todayProfit] = await connection.query(`
      SELECT COALESCE(SUM(total_amount), 0) - COALESCE(SUM(
        (SELECT SUM(bi.quantity * ml.cost_price) 
         FROM billing_items bi 
         JOIN material_list ml ON bi.material_name_id = ml.material_name_id 
         WHERE bi.billing_id = b.id)
      ), 0) as profit
      FROM billing b
      WHERE DATE(date) = CURDATE()
    `);
    
    // Daily profit (last 30 days)
    const [dailyProfit] = await connection.query(`
      SELECT DATE(date) as date, 
             COALESCE(SUM(total_amount), 0) as revenue,
             COALESCE(SUM(
               (SELECT SUM(bi.quantity * ml.cost_price) 
                FROM billing_items bi 
                JOIN material_list ml ON bi.material_name_id = ml.material_name_id 
                WHERE bi.billing_id = b.id)
             ), 0) as cost,
             COALESCE(SUM(total_amount), 0) - COALESCE(SUM(
               (SELECT SUM(bi.quantity * ml.cost_price) 
                FROM billing_items bi 
                JOIN material_list ml ON bi.material_name_id = ml.material_name_id 
                WHERE bi.billing_id = b.id)
             ), 0) as profit
      FROM billing b
      WHERE DATE(date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(date)
      ORDER BY date DESC
      LIMIT 30
    `);
    
    // Monthly profit (last 12 months)
    const [monthlyProfit] = await connection.query(`
      SELECT YEAR(date) as year, 
             MONTH(date) as month,
             COALESCE(SUM(total_amount), 0) - COALESCE(SUM(
               (SELECT SUM(bi.quantity * ml.cost_price) 
                FROM billing_items bi 
                JOIN material_list ml ON bi.material_name_id = ml.material_name_id 
                WHERE bi.billing_id = b.id)
             ), 0) as profit
      FROM billing b
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY year DESC, month DESC
      LIMIT 12
    `);
    
    // Yearly profit
    const [yearlyProfit] = await connection.query(`
      SELECT YEAR(date) as year,
             COALESCE(SUM(total_amount), 0) - COALESCE(SUM(
               (SELECT SUM(bi.quantity * ml.cost_price) 
                FROM billing_items bi 
                JOIN material_list ml ON bi.material_name_id = ml.material_name_id 
                WHERE bi.billing_id = b.id)
             ), 0) as profit
      FROM billing b
      GROUP BY YEAR(date)
      ORDER BY year DESC
      LIMIT 5
    `);
    
    // Total lifetime profit
    const [lifetimeProfit] = await connection.query(`
      SELECT COALESCE(SUM(total_amount), 0) - COALESCE(SUM(
        (SELECT SUM(bi.quantity * ml.cost_price) 
         FROM billing_items bi 
         JOIN material_list ml ON bi.material_name_id = ml.material_name_id 
         WHERE bi.billing_id = b.id)
      ), 0) as total_profit
      FROM billing b
    `);
    
    // Low stock alerts (quantity < 10)
    const [lowStockAlerts] = await connection.query(`
      SELECT ml.*, mn.name as material_name 
      FROM material_list ml 
      JOIN material_names mn ON ml.material_name_id = mn.id 
      WHERE ml.total_quantity < 10
      ORDER BY ml.total_quantity ASC
      LIMIT 10
    `);
    
    // Today's sales
    const [todaySales] = await connection.query(`
      SELECT COALESCE(COUNT(*), 0) as total_bills,
             COALESCE(SUM(total_amount), 0) as total_revenue
      FROM billing 
      WHERE DATE(date) = CURDATE()
    `);
    
    // Get month names for monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    res.json({
      todayProfit: parseFloat(todayProfit[0]?.profit || 0),
      dailyProfit: dailyProfit.map(row => ({
        date: row.date,
        profit: parseFloat(row.profit || 0)
      })),
      monthlyProfit: monthlyProfit.map(row => ({
        year: row.year,
        month: row.month,
        month_name: monthNames[row.month - 1],
        profit: parseFloat(row.profit || 0)
      })),
      yearlyProfit: yearlyProfit.map(row => ({
        year: row.year,
        profit: parseFloat(row.profit || 0)
      })),
      lifetimeProfit: parseFloat(lifetimeProfit[0]?.total_profit || 0),
      lowStockAlerts: lowStockAlerts,
      todaySales: {
        bills: parseInt(todaySales[0]?.total_bills || 0),
        revenue: parseFloat(todaySales[0]?.total_revenue || 0)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardData
};