/**
 * Contact controller – handles the contact form submission.
 */

'use strict';

const Contact = require('../models/Contact');

const contactController = {
  /** POST /api/contact – store a new contact message */
  async submit(req, res, next) {
    try {
      const { name, email, message } = req.body;

      // Validation is handled by express-validator in the route layer;
      // this is a secondary guard.
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
      }

      Contact.create({ name: name.trim(), email: email.trim(), message: message.trim() });

      res.status(201).json({ success: true, message: 'Thank you! Your message has been received.' });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/contact – list all messages (admin use) */
  async getAll(req, res, next) {
    try {
      const messages = Contact.getAll();
      res.json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = contactController;
