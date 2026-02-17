/**
 * Cart controller – handles request/response logic for cart endpoints.
 * Server-side cart is a placeholder; the primary cart lives in localStorage.
 */

'use strict';

const CartItem = require('../models/CartItem');
const Book     = require('../models/Book');

const cartController = {
  /** GET /api/cart?session=<id> – return items for a session */
  async get(req, res, next) {
    try {
      const sessionId = req.query.session;
      if (!sessionId) return res.status(400).json({ success: false, error: 'session query parameter required' });

      const items = CartItem.getBySession(sessionId);

      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      res.json({ success: true, data: { items, total: Math.round(total * 100) / 100 } });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/cart – add an item { session, bookId, quantity? } */
  async add(req, res, next) {
    try {
      const { session, bookId, quantity } = req.body;
      if (!session || !bookId) {
        return res.status(400).json({ success: false, error: 'session and bookId are required' });
      }

      const book = Book.getById(Number(bookId));
      if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

      CartItem.addOrIncrement(session, Number(bookId), Number(quantity) || 1);

      const items = CartItem.getBySession(session);
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      res.status(201).json({ success: true, data: { items, total: Math.round(total * 100) / 100 } });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/cart/:id – update quantity { session, quantity } */
  async update(req, res, next) {
    try {
      const { session, quantity } = req.body;
      if (!session || !quantity) {
        return res.status(400).json({ success: false, error: 'session and quantity are required' });
      }
      if (quantity < 1) {
        return res.status(400).json({ success: false, error: 'quantity must be at least 1' });
      }

      CartItem.updateQuantity(Number(req.params.id), session, Number(quantity));

      const items = CartItem.getBySession(session);
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      res.json({ success: true, data: { items, total: Math.round(total * 100) / 100 } });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/cart/:id?session=<id> – remove an item */
  async remove(req, res, next) {
    try {
      const sessionId = req.query.session;
      if (!sessionId) return res.status(400).json({ success: false, error: 'session query parameter required' });

      CartItem.remove(Number(req.params.id), sessionId);

      const items = CartItem.getBySession(sessionId);
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      res.json({ success: true, data: { items, total: Math.round(total * 100) / 100 } });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/cart?session=<id> – clear entire cart */
  async clear(req, res, next) {
    try {
      const sessionId = req.query.session;
      if (!sessionId) return res.status(400).json({ success: false, error: 'session query parameter required' });

      CartItem.clearSession(sessionId);
      res.json({ success: true, data: { items: [], total: 0 } });
    } catch (err) {
      next(err);
    }
  },

  /* ---------------------------------------------------------------- */
  /*  Placeholder – payment / checkout                                 */
  /* ---------------------------------------------------------------- */

  /** POST /api/cart/checkout – placeholder for future payment integration */
  async checkout(req, res, _next) {
    // TODO: Integrate payment gateway (Stripe, PayPal, etc.)
    res.json({
      success: true,
      message: 'Checkout functionality coming soon. Payment gateway not yet integrated.',
      data: null
    });
  }
};

module.exports = cartController;
