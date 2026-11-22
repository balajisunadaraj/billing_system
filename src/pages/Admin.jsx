import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

function Admin() {
  const [products, setProducts] = useState([]);
  const [report, setReport] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', purchasePrice: '', quantity: '' });
  const [saleForm, setSaleForm] = useState({ productId: '', quantitySold: '', amountPaid: '', saleDate: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsJson, reportJson] = await Promise.all([authFetch('/products'), authFetch('/report')]);
      setProducts(productsJson.products || []);
      setReport(reportJson);
    } catch (error) {
      setMessage(error.message || 'Unable to load admin data.');
    }
  }

  async function handleAddProduct(event) {
    event.preventDefault();
    const payload = {
      name: productForm.name,
      purchasePrice: Number(productForm.purchasePrice),
      quantity: Number(productForm.quantity)
    };

    try {
      await authFetch('/products', { method: 'POST', body: payload });
      setProductForm({ name: '', purchasePrice: '', quantity: '' });
      setMessage('Product added successfully. Sale price will use a default markup.');
      fetchData();
    } catch (error) {
      setMessage(error.message || 'Unable to add product.');
    }
  }

  async function handleAddSale(event) {
    event.preventDefault();
    const payload = {
      productId: Number(saleForm.productId),
      quantitySold: Number(saleForm.quantitySold),
      amountPaid: Number(saleForm.amountPaid),
      saleDate: saleForm.saleDate || new Date().toISOString().slice(0, 10)
    };

    try {
      await authFetch('/sales', { method: 'POST', body: payload });
      setSaleForm({ productId: '', quantitySold: '', amountPaid: '', saleDate: '' });
      setMessage('Sale recorded successfully.');
      fetchData();
    } catch (error) {
      setMessage(error.message || 'Unable to record sale.');
    }
  }

  return (
    <section className="page-content">
      <h2>Admin Dashboard</h2>
      <p>Add products, record sales, and view stock, profit, and payment summaries.</p>

      {message && <div className="message-box">{message}</div>}

      <div className="admin-grid">
        <div className="card">
          <h3>Add Product</h3>
          <form onSubmit={handleAddProduct} className="form-grid">
            <label>
              Name
              <input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              Purchase Price
              <input
                type="number"
                step="0.01"
                value={productForm.purchasePrice}
                onChange={(e) => setProductForm({ ...productForm, purchasePrice: e.target.value })}
                required
              />
            </label>
            <label>
              Quantity
              <input
                type="number"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                required
              />
            </label>
            <p className="note-text">Sale price will be set automatically with a default markup.</p>
            <button type="submit">Save Product</button>
          </form>
        </div>

        <div className="card">
          <h3>Record Sale</h3>
          <form onSubmit={handleAddSale} className="form-grid">
            <label>
              Product
              <select
                value={saleForm.productId}
                onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity Sold
              <input
                type="number"
                value={saleForm.quantitySold}
                onChange={(e) => setSaleForm({ ...saleForm, quantitySold: e.target.value })}
                required
              />
            </label>
            <label>
              Amount Paid
              <input
                type="number"
                step="0.01"
                value={saleForm.amountPaid}
                onChange={(e) => setSaleForm({ ...saleForm, amountPaid: e.target.value })}
                required
              />
            </label>
            <label>
              Sale Date
              <input
                type="date"
                value={saleForm.saleDate}
                onChange={(e) => setSaleForm({ ...saleForm, saleDate: e.target.value })}
              />
            </label>
            <button type="submit">Record Sale</button>
          </form>
        </div>
      </div>

      <div className="summary-grid">
        <div className="card summary-card">
          <h3>Stock Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Remaining</th>
                <th>Purchase</th>
                <th>Sale</th>
              </tr>
            </thead>
            <tbody>
              {(report?.remainingStock || []).map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.purchasePrice.toFixed(2)}</td>
                  <td>{item.salePrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card summary-card">
          <h3>Financial Summary</h3>
          <div className="summary-row">
            <span>Weekly Profit</span>
            <strong>${report?.weeklyProfit?.toFixed(2) || '0.00'}</strong>
          </div>
          <div className="summary-row">
            <span>Monthly Profit</span>
            <strong>${report?.monthlyProfit?.toFixed(2) || '0.00'}</strong>
          </div>
          <div className="summary-row">
            <span>Total Paid</span>
            <strong>${report?.totalPaid?.toFixed(2) || '0.00'}</strong>
          </div>
          <div className="summary-row">
            <span>Pending Amount</span>
            <strong>${report?.totalPending?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;
