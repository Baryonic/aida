/**
 * CartItem model – server-side cart persistence (optional / placeholder).
 * Carts are keyed by a session_id string provided by the client.
 */

'use strict';

const db = require('./database');

const CartItem = {
  /** Get all items for a session. Joins with books for display data. */
  getBySession(sessionId) {
    return db.prepare(`
      SELECT ci.id, ci.session_id, ci.book_id, ci.quantity, ci.created_at,
             b.title, b.price, b.cover_image, b.slug
      FROM cart_items ci
      JOIN books b ON b.id = ci.book_id
      WHERE ci.session_id = ?
      ORDER BY ci.created_at ASC
    `).all(sessionId);
  },

  /** Add a book to the cart or increment quantity if it already exists. */
  addOrIncrement(sessionId, bookId, quantity = 1) {
    const existing = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE session_id = ? AND book_id = ?'
    ).get(sessionId, bookId);

    if (existing) {
      return db.prepare(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?'
      ).run(quantity, existing.id);
    }
    return db.prepare(
      'INSERT INTO cart_items (session_id, book_id, quantity) VALUES (?, ?, ?)'
    ).run(sessionId, bookId, quantity);
  },

  /** Set the quantity of a specific cart item. */
  updateQuantity(id, sessionId, quantity) {
    return db.prepare(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND session_id = ?'
    ).run(quantity, id, sessionId);
  },

  /** Remove a single item from the cart. */
  remove(id, sessionId) {
    return db.prepare(
      'DELETE FROM cart_items WHERE id = ? AND session_id = ?'
    ).run(id, sessionId);
  },

  /** Clear the entire cart for a session. */
  clearSession(sessionId) {
    return db.prepare(
      'DELETE FROM cart_items WHERE session_id = ?'
    ).run(sessionId);
  }
};

module.exports = CartItem;
