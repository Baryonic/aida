/**
 * Books controller – handles request/response logic for book endpoints.
 */

'use strict';

const Book = require('../models/Book');

const booksController = {
  /** GET /api/books – return all books */
  async getAll(req, res, next) {
    try {
      const books = Book.getAll();
      res.json({ success: true, data: books });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/books/featured – return featured books only */
  async getFeatured(req, res, next) {
    try {
      const books = Book.getFeatured();
      res.json({ success: true, data: books });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/books/:id – return a single book */
  async getOne(req, res, next) {
    try {
      const book = Book.getById(Number(req.params.id));
      if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
      res.json({ success: true, data: book });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/books/slug/:slug – return a single book by slug */
  async getBySlug(req, res, next) {
    try {
      const book = Book.getBySlug(req.params.slug);
      if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
      res.json({ success: true, data: book });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = booksController;
