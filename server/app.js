const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/database');
const { seed } = require('./seed/seedData');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// System health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'CodeAlpha E-commerce Store',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application routing fallback for unhandled routes
app.use((req, res, next) => {
  if (req.method === 'GET') {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.'
  });
});

// Start Server and seed initial data
async function startServer() {
  try {
    await initDatabase();
    await seed();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 CodeAlpha E-Commerce Store Server is running!`);
      console.log(`📡 Local URL: http://localhost:${PORT}`);
      console.log(`📦 Database: SQLite initialized & verified`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
