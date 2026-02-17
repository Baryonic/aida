/**
 * cart.js – Client-side shopping cart powered by localStorage.
 * Exposes a global `Cart` object for use across pages.
 */

'use strict';

const Cart = (() => {
  const STORAGE_KEY = 'aida_cart';

  /* ---- helpers ---- */
  const _read = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  };
  const _write = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    _updateBadge();
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
  };

  /* ---- public API ---- */

  /** Get all cart items */
  const getItems = () => _read();

  /** Number of unique products */
  const getCount = () => _read().reduce((sum, i) => sum + i.quantity, 0);

  /** Total price */
  const getTotal = () => {
    return Math.round(_read().reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
  };

  /** Add a book to cart (or increment if exists) */
  const add = (book) => {
    const items = _read();
    const existing = items.find(i => i.id === book.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: book.id,
        title: book.title,
        price: book.price,
        cover_image: book.cover_image,
        slug: book.slug,
        quantity: 1
      });
    }
    _write(items);
    _animateCartIcon();
    return items;
  };

  /** Set quantity for a specific item */
  const setQuantity = (bookId, qty) => {
    const items = _read();
    const item = items.find(i => i.id === bookId);
    if (item) {
      item.quantity = Math.max(1, qty);
      _write(items);
    }
  };

  /** Remove a book from the cart */
  const remove = (bookId) => {
    const items = _read().filter(i => i.id !== bookId);
    _write(items);
    return items;
  };

  /** Empty the cart entirely */
  const clear = () => _write([]);

  /* ---- UI helpers ---- */

  const _updateBadge = () => {
    const badge = document.querySelector('.navbar__cart-count');
    if (!badge) return;
    const count = getCount();
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  };

  const _animateCartIcon = () => {
    const badge = document.querySelector('.navbar__cart-count');
    if (!badge) return;
    badge.classList.remove('bounce');
    // Force reflow to restart animation
    void badge.offsetWidth;
    badge.classList.add('bounce');
  };

  /* ---- init ---- */
  document.addEventListener('DOMContentLoaded', _updateBadge);

  return { getItems, getCount, getTotal, add, setQuantity, remove, clear };
})();

// Expose globally
window.Cart = Cart;
