const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const patronesRoutes = require('./routes/patrones');
const viewerRoutes = require('./routes/viewer');
const pagosRoutes = require('./routes/pagos');
const adminRoutes = require('./routes/admin');
const rawBody = require('./middleware/rawBody');

const app = express();

// CORS - multiple origins for development and production
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'https://crochetflix.app',
    'https://www.crochetflix.app'
  ].filter(Boolean),
  credentials: true
}));

// JSON parser with rawBody capture for webhooks (HMAC verification)
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    if (req.path && req.path.includes('/webhook')) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patrones', patronesRoutes);
app.use('/api/viewer', viewerRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});


const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

const monetizationRoutes = require('./routes/monetization');
app.use('/api/monetizacion', monetizationRoutes);

module.exports = app;