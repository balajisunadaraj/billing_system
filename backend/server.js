import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { query, get, all } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/dashboard', async (req, res) => {
  try {
    const companies = await all('SELECT id, company_name, contact_person FROM companies ORDER BY created_at DESC LIMIT 5');
    const companyCount = await get('SELECT COUNT(*) AS value FROM companies');
    const totalPurchased = await get('SELECT COALESCE(SUM(quantity_purchased), 0) AS value FROM purchases');
    const totalWaste = await get('SELECT COALESCE(SUM(waste_quantity), 0) AS value FROM purchases');
    const totalDelivered = await get('SELECT COALESCE(SUM(quantity_delivered), 0) AS value FROM deliveries');
    const totalStock = await get(
      `SELECT COALESCE(SUM(quantity_purchased), 0) - COALESCE(SUM(waste_quantity), 0) - COALESCE((SELECT SUM(quantity_delivered) FROM deliveries), 0) AS value FROM purchases`
    );
    const weeklyRevenue = await get(`
      SELECT COALESCE(SUM(grand_total), 0) AS value FROM bills WHERE billing_date >= current_date - INTERVAL '7 days'
    `);
    const pendingBills = await get(`
      SELECT COUNT(*) AS value FROM bills WHERE grand_total > 0
    `);

    res.json({
      totalCompanies: Number(companyCount.value),
      totalPurchased: Number(totalPurchased.value),
      totalDelivered: Number(totalDelivered.value),
      availableStock: Number(totalStock.value),
      totalWaste: Number(totalWaste.value),
      weeklyRevenue: Number(weeklyRevenue.value),
      pendingBills: Number(pendingBills.value),
      recentCompanies: companies.map((company) => ({ ...company, remaining_stock: 0 }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const companies = await all('SELECT * FROM companies ORDER BY created_at DESC');
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  const { company_name, contact_person, phone_number, email, address, gst_number, plate_rate, gst_applicable } = req.body;
  try {
    const result = await query(
      `INSERT INTO companies (company_name, contact_person, phone_number, email, address, gst_number, plate_rate, gst_applicable)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [company_name, contact_person, phone_number, email, address, gst_number, plate_rate, gst_applicable]
    );
    res.json({ company: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  const { id } = req.params;
  const { company_name, contact_person, phone_number, email, address, gst_number, plate_rate, gst_applicable } = req.body;
  try {
    const result = await query(
      `UPDATE companies SET company_name=$1, contact_person=$2, phone_number=$3, email=$4, address=$5, gst_number=$6, plate_rate=$7, gst_applicable=$8 WHERE id=$9 RETURNING *`,
      [company_name, contact_person, phone_number, email, address, gst_number, plate_rate, gst_applicable, id]
    );
    res.json({ company: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await all('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, purchasePrice, quantity } = req.body;

  if (!name || purchasePrice == null || quantity == null) {
    return res.status(400).json({ error: 'Missing required product fields.' });
  }

  const salePrice = Number(purchasePrice) * 1.2;

  try {
    const result = await query(
      `INSERT INTO products (name, purchase_price, sale_price, quantity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, purchasePrice, salePrice, quantity]
    );
    res.json({ product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const { productId, quantitySold, amountPaid, saleDate } = req.body;

  if (!productId || quantitySold == null || amountPaid == null || !saleDate) {
    return res.status(400).json({ error: 'Missing required sale fields.' });
  }

  try {
    const product = await get('SELECT * FROM products WHERE id = $1', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (Number(quantitySold) > Number(product.quantity)) {
      return res.status(400).json({ error: 'Sale exceeds available stock.' });
    }

    await query('UPDATE products SET quantity = quantity - $1 WHERE id = $2', [quantitySold, productId]);

    const result = await query(
      `INSERT INTO sales (product_id, quantity_sold, amount_paid, sale_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [productId, quantitySold, amountPaid, saleDate]
    );

    res.json({ sale: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/report', async (req, res) => {
  try {
    const totalProducts = await get('SELECT COUNT(*) AS value FROM products');
    const totalStock = await get('SELECT COALESCE(SUM(quantity), 0) AS value FROM products');
    const totalSales = await get('SELECT COUNT(*) AS value FROM sales');
    const totalRevenue = await get('SELECT COALESCE(SUM(amount_paid), 0) AS value FROM sales');

    res.json({
      totalProducts: Number(totalProducts.value),
      totalStock: Number(totalStock.value),
      totalSales: Number(totalSales.value),
      totalRevenue: Number(totalRevenue.value)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id/details', async (req, res) => {
  const { id } = req.params;
  try {
    const company = await get('SELECT * FROM companies WHERE id = $1', [id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    const totals = await get(`
      SELECT
        COALESCE(SUM(quantity_purchased),0) AS total_purchased,
        COALESCE(SUM(waste_quantity),0) AS total_waste
      FROM purchases WHERE company_id=$1`,
      [id]
    );

    const delivered = await get(`
      SELECT COALESCE(SUM(quantity_delivered),0) AS total_delivered FROM deliveries WHERE company_id=$1`,
      [id]
    );

    const variance = await get(`
      SELECT COALESCE(SUM(subtotal + gst_amount),0) AS earned FROM bills WHERE company_id=$1`,
      [id]
    );

    const remainingStock = Number(totals.total_purchased) - Number(totals.total_waste) - Number(delivered.total_delivered);
    const purchaseTrend = Array.from({ length: 5 }).map((_, index) => ({ label: `Week ${index + 1}`, value: Math.max(0, 20 - index * 3) }));
    const deliveryTrend = Array.from({ length: 5 }).map((_, index) => ({ label: `Week ${index + 1}`, value: Math.max(0, 15 - index * 2) }));

    res.json({
      ...company,
      total_purchased: Number(totals.total_purchased),
      total_waste: Number(totals.total_waste),
      total_delivered: Number(delivered.total_delivered),
      remaining_stock: Number(remainingStock),
      total_earned: Number(variance.earned),
      purchase_trend: purchaseTrend,
      delivery_trend: deliveryTrend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/purchases', async (req, res) => {
  try {
    const purchases = await all(
      `SELECT p.*, c.company_name FROM purchases p JOIN companies c ON p.company_id = c.id ORDER BY purchase_date DESC`
    );
    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  const { purchase_date, company_id, plate_type, quantity_purchased, waste_quantity, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO purchases (company_id, purchase_date, plate_type, quantity_purchased, waste_quantity, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [company_id, purchase_date, plate_type, quantity_purchased, waste_quantity, notes]
    );
    res.json({ purchase: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/deliveries', async (req, res) => {
  try {
    const deliveries = await all(
      `SELECT d.*, c.company_name FROM deliveries d JOIN companies c ON d.company_id = c.id ORDER BY delivery_date DESC`
    );
    res.json({ deliveries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deliveries', async (req, res) => {
  const { delivery_date, company_id, quantity_delivered, notes } = req.body;
  try {
    const stock = await get(
      `SELECT COALESCE(SUM(quantity_purchased),0) - COALESCE(SUM(waste_quantity),0) - COALESCE((SELECT SUM(quantity_delivered) FROM deliveries WHERE company_id=$1),0) AS available_stock
       FROM purchases WHERE company_id=$1`,
      [company_id]
    );

    if (Number(quantity_delivered) > Number(stock.available_stock)) {
      return res.status(400).json({ error: 'Delivery exceeds available stock.' });
    }

    const result = await query(
      `INSERT INTO deliveries (company_id, delivery_date, quantity_delivered, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [company_id, delivery_date, quantity_delivered, notes]
    );
    res.json({ delivery: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills', async (req, res) => {
  try {
    const bills = await all(
      `SELECT b.*, c.company_name FROM bills b JOIN companies c ON b.company_id = c.id ORDER BY billing_date DESC`
    );
    res.json({ bills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bills', async (req, res) => {
  const {
    company_id,
    customer_name,
    customer_gst,
    billing_date,
    quantity_delivered,
    rate_per_plate,
    gst_applicable,
    gst_percentage,
    gst_amount,
    subtotal,
    grand_total
  } = req.body;

  try {
    const invoiceNumber = `INV-${Date.now()}`;
    const result = await query(
      `INSERT INTO bills (invoice_number, company_id, billing_date, customer_name, customer_gst, quantity_delivered, rate_per_plate, gst_applicable, gst_percentage, gst_amount, subtotal, grand_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [invoiceNumber, company_id, billing_date, customer_name, customer_gst, quantity_delivered, rate_per_plate, gst_applicable, gst_percentage, gst_amount, subtotal, grand_total]
    );
    res.json({ bill: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await get('SELECT * FROM office_settings ORDER BY id DESC LIMIT 1');
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  const {
    office_name,
    owner_name,
    phone_number,
    email,
    address,
    gst_number,
    company_logo_url,
    signature_image_url,
    upi_qr_url,
    bank_name,
    account_number,
    ifsc_code
  } = req.body;

  try {
    const result = await query(
      `UPDATE office_settings SET office_name=$1, owner_name=$2, phone_number=$3, email=$4, address=$5, gst_number=$6, company_logo_url=$7, signature_image_url=$8, upi_qr_url=$9, bank_name=$10, account_number=$11, ifsc_code=$12, updated_at=current_timestamp
       WHERE id = (SELECT id FROM office_settings ORDER BY id DESC LIMIT 1)
       RETURNING *`,
      [office_name, owner_name, phone_number, email, address, gst_number, company_logo_url, signature_image_url, upi_qr_url, bank_name, account_number, ifsc_code]
    );
    res.json({ settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const purchased = await get('SELECT COALESCE(SUM(quantity_purchased),0) AS value FROM purchases');
    const delivered = await get('SELECT COALESCE(SUM(quantity_delivered),0) AS value FROM deliveries');
    const waste = await get('SELECT COALESCE(SUM(waste_quantity),0) AS value FROM purchases');
    const revenue = await get('SELECT COALESCE(SUM(grand_total),0) AS value FROM bills');
    const stock = await get(
      `SELECT COALESCE(SUM(quantity_purchased),0) - COALESCE(SUM(waste_quantity),0) - COALESCE((SELECT SUM(quantity_delivered) FROM deliveries),0) AS value FROM purchases`
    );

    res.json({
      purchased_plates: Number(purchased.value),
      delivered_plates: Number(delivered.value),
      remaining_stock: Number(stock.value),
      waste_plates: Number(waste.value),
      revenue: Number(revenue.value)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
