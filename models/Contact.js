/**
 * Contact model – data-access layer for the contact_messages table.
 */

'use strict';

const db = require('./database');

const Contact = {
  /** Retrieve all messages, newest first. */
  getAll() {
    return db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  },

  /** Retrieve a single message by id. */
  getById(id) {
    return db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  },

  /** Store a new contact message. */
  create({ name, email, message }) {
    const stmt = db.prepare(
      'INSERT INTO contact_messages (name, email, message) VALUES (@name, @email, @message)'
    );
    return stmt.run({ name, email, message });
  },

  /** Mark a message as read. */
  markRead(id) {
    return db.prepare('UPDATE contact_messages SET read = 1 WHERE id = ?').run(id);
  },

  /** Delete a message by id. */
  delete(id) {
    return db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
  }
};

module.exports = Contact;
