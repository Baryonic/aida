/**
 * AIDA – Children's Books Author & Teacher Website
 * Main Express server entry point.
 */

'use strict';

require('dotenv').config();

const express     = require('express');
const path        = require('path');
const helmet      = require('helmet');
const cors        = require('cors');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const morgan      = require('morgan');

const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const booksRoutes   = require('./routes/books');
const cartRoutes    = require('./routes/cart');
const contactRoutes = require('./routes/contact');

const app  = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

/* ------------------------------------------------------------------ */
/*  Global middleware                                                   */
/* ------------------------------------------------------------------ */

// Security headers (allow inline styles/scripts for our own pages)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
        imgSrc:     ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"]
      }
    }
  })
);

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP logging – tiny in production, dev style in development
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Custom colour-coded logger
app.use(logger);

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

/* ------------------------------------------------------------------ */
/*  Static files                                                       */
/* ------------------------------------------------------------------ */

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

/* ------------------------------------------------------------------ */
/*  API routes                                                         */
/* ------------------------------------------------------------------ */

app.use('/api/books',   apiLimiter, booksRoutes);
app.use('/api/cart',    apiLimiter, cartRoutes);
app.use('/api/contact', apiLimiter, contactRoutes);

/* ------------------------------------------------------------------ */
/*  HTML page routes – serve static HTML files                         */
/* ------------------------------------------------------------------ */

const viewsDir = path.join(__dirname, 'views');

app.get('/',        (_req, res) => res.sendFile(path.join(viewsDir, 'index.html')));
app.get('/books',   (_req, res) => res.sendFile(path.join(viewsDir, 'books.html')));
app.get('/cart',    (_req, res) => res.sendFile(path.join(viewsDir, 'cart.html')));
app.get('/contact', (_req, res) => res.sendFile(path.join(viewsDir, 'contact.html')));

/* ------------------------------------------------------------------ */
/*  404 catch-all                                                      */
/* ------------------------------------------------------------------ */

app.use((_req, res) => {
  res.status(404).sendFile(path.join(viewsDir, '404.html'), (err) => {
    if (err) res.status(404).json({ success: false, error: 'Not found' });
  });
});

/* ------------------------------------------------------------------ */
/*  Error handler                                                      */
/* ------------------------------------------------------------------ */

app.use(errorHandler);

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

// Listen on all network interfaces (0.0.0.0) instead of just localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀  AIDA server running at http://localhost:${PORT}`);
  console.log(`    Network Access: http://${require('os').networkInterfaces()['Wi-Fi']?.[1]?.address || 'YOUR_IP'}:${PORT}`);
  console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`    Database    : ${process.env.DB_PATH || './data/aida.db'}\n`);
});

module.exports = app;
