import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:4000/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: '', quantity: '', amountPaid: '', saleDate: '' });
  const [message, setMessage] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountDue, setAmountDue] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const product = products.find((item) => item.id === Number(form.productId));
    const qty = Number(form.quantity || 0);
    const paid = Number(form.amountPaid || 0);

    if (product && qty > 0) {
      const total = qty * Number(product.sale_price);
      setTotalAmount(total);
      setAmountDue(Math.max(0, total - paid));
    } else {
      setTotalAmount(0);
      setAmountDue(0);
    }
  }, [form, products]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(form.productId)),
    [form.productId, products]
  );

  async function fetchProducts() {
    try {
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      setMessage('Unable to load products.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!form.productId || !form.quantity || form.amountPaid === '') {
      setMessage('Please complete all fields.');
      return;
    }

    const payload = {
      productId: Number(form.productId),
      quantitySold: Number(form.quantity),
      amountPaid: Number(form.amountPaid),
      saleDate: form.saleDate || new Date().toISOString().slice(0, 10)
    };

    const response = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      setMessage('Sale complete. Remaining stock updated.');
      setForm({ productId: '', quantity: '', amountPaid: '', saleDate: '' });
      fetchProducts();
    } else {
      setMessage(result.error || 'Unable to complete sale.');
    }
  }

  return (
    <section className="page-content">
      <h2>Home Billing Page</h2>
      <p>Use the billing form below to create sales and update stock in the admin database.</p>

      {message && <div className="message-box">{message}</div>}

      <div className="billing-form-card">
        <h3>Billing Form</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Product
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (stock: {product.quantity})
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </label>

          <label>
            Amount Paid
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amountPaid}
              onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
              required
            />
          </label>

          <label>
            Sale Date
            <input
              type="date"
              value={form.saleDate}
              onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
            />
          </label>

          <div className="billing-summary">
            <div>
              <span>Total Amount</span>
              <strong>${totalAmount.toFixed(2)}</strong>
            </div>
            <div>
              <span>Amount Due</span>
              <strong>${amountDue.toFixed(2)}</strong>
            </div>
          </div>

          <button type="submit">Submit Billing</button>
        </form>
      </div>

      {selectedProduct && (
        <div className="product-info-card">
          <h4>Selected Product Details</h4>
          <p>
            <strong>Sale Price:</strong> ${Number(selectedProduct.sale_price).toFixed(2)}
          </p>
          <p>
            <strong>Remaining Stock:</strong> {selectedProduct.quantity}
          </p>
        </div>
      )}
    </section>
  );
}

export default Home;
