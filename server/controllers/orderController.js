const { query } = require('../config/database');

// Create new order (order processing for Indian eCommerce)
async function createOrder(req, res) {
  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode,
      paymentMethod,
      discountCode
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Shopping cart is empty. Please add items before placing order.' });
    }

    if (!customerName || !customerEmail || !shippingAddress || !city || !postalCode) {
      return res.status(400).json({ success: false, message: 'Please complete all required shipping details.' });
    }

    // Validate items and verify pricing / stock from database
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await query.get('SELECT * FROM products WHERE id = ?', [item.productId || item.id]);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ID ${item.productId || item.id} is no longer available.` });
      }

      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} units left.`
        });
      }

      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      verifiedItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: qty,
        image_url: product.image_url,
        currentStock: product.stock
      });
    }

    // Apply promo discount (DIWALI20 = 20%, CODEALPHA10 = 10%, DESI100 = ₹100 flat)
    let discount = 0;
    if (discountCode) {
      const code = discountCode.trim().toUpperCase();
      if (code === 'DIWALI20') {
        discount = Math.round(subtotal * 0.20);
      } else if (code === 'CODEALPHA10') {
        discount = Math.round(subtotal * 0.10);
      } else if (code === 'DESI100') {
        discount = Math.min(100, subtotal);
      }
    }

    // Free delivery in India above ₹999, else ₹49 standard shipping
    const netSubtotal = subtotal - discount;
    const shippingFee = netSubtotal >= 999 || subtotal === 0 ? 0 : 49;
    const totalAmount = Math.max(0, netSubtotal + shippingFee);

    // Generate Indian order number
    const orderNumber = 'ORD-IN-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
    const userId = req.user ? req.user.id : null;

    // Insert Order
    const orderResult = await query.run(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, city, postal_code, subtotal, discount, shipping_fee, total_amount, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      userId,
      customerName.trim(),
      customerEmail.trim(),
      customerPhone || '',
      shippingAddress.trim(),
      city.trim(),
      postalCode.trim(),
      parseFloat(subtotal.toFixed(2)),
      parseFloat(discount.toFixed(2)),
      parseFloat(shippingFee.toFixed(2)),
      parseFloat(totalAmount.toFixed(2)),
      paymentMethod || 'UPI (Google Pay / PhonePe)',
      'Processing'
    ]);

    const orderId = orderResult.lastID;

    // Insert order items and deduct stock
    for (const item of verifiedItems) {
      await query.run(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id,
        item.product_name,
        item.price,
        item.quantity,
        item.image_url
      ]);

      // Deduct inventory
      await query.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Delivery across India.',
      order: {
        id: orderId,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        shippingFee: parseFloat(shippingFee.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        paymentMethod: paymentMethod || 'UPI (Google Pay / PhonePe)',
        status: 'Processing',
        itemsCount: verifiedItems.length,
        items: verifiedItems
      }
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing order.' });
  }
}

// Get user orders (requires login)
async function getUserOrders(req, res) {
  try {
    const userId = req.user.id;
    const orders = await query.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await query.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return {
          ...order,
          items
        };
      })
    );

    return res.json({
      success: true,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('getUserOrders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order history.' });
  }
}

// Get order details by order_number or id
async function getOrderById(req, res) {
  try {
    const { identifier } = req.params;
    let order;

    if (!isNaN(identifier)) {
      order = await query.get('SELECT * FROM orders WHERE id = ?', [identifier]);
    } else {
      order = await query.get('SELECT * FROM orders WHERE order_number = ?', [identifier]);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const items = await query.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    return res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};
