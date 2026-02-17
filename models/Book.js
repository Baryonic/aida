/**
 * Book model – thin data-access layer around the books table.
 */

'use strict';

const db = require('./database');

const Book = {
  /** Retrieve every book, ordered by newest first. */
  getAll() {
    return db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
  },

  /** Retrieve only featured books. */
  getFeatured() {
    return db.prepare('SELECT * FROM books WHERE featured = 1 ORDER BY created_at DESC').all();
  },

  /** Find a single book by its numeric id. */
  getById(id) {
    return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  },

  /** Find a single book by its URL slug. */
  getBySlug(slug) {
    return db.prepare('SELECT * FROM books WHERE slug = ?').get(slug);
  },

  /** Insert a new book record. Returns the new row info. */
  create({ title, slug, author, description, long_description, price, cover_image, age_range, pages, isbn, featured }) {
    const stmt = db.prepare(`
      INSERT INTO books (title, slug, author, description, long_description, price, cover_image, age_range, pages, isbn, featured)
      VALUES (@title, @slug, @author, @description, @long_description, @price, @cover_image, @age_range, @pages, @isbn, @featured)
    `);
    return stmt.run({ title, slug, author: author || 'Aida', description, long_description, price, cover_image, age_range, pages, isbn, featured: featured ? 1 : 0 });
  },

  /** Update an existing book by id. */
  update(id, fields) {
    const allowed = ['title', 'slug', 'author', 'description', 'long_description', 'price', 'cover_image', 'age_range', 'pages', 'isbn', 'featured'];
    const sets = [];
    const values = {};
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = @${key}`);
        values[key] = key === 'featured' ? (fields[key] ? 1 : 0) : fields[key];
      }
    }
    if (sets.length === 0) return null;
    values.id = id;
    sets.push("updated_at = datetime('now')");
    return db.prepare(`UPDATE books SET ${sets.join(', ')} WHERE id = @id`).run(values);
  },

  /** Delete a book by id. */
  delete(id) {
    return db.prepare('DELETE FROM books WHERE id = ?').run(id);
  }
};

module.exports = Book;
