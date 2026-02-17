/**
 * Contact routes – includes express-validator sanitization & validation.
 */

'use strict';

const { Router }           = require('express');
const { body, validationResult } = require('express-validator');
const contactController    = require('../controllers/contactController');

const router = Router();

/* ---- Validation / sanitization rules ---- */
const contactRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 200 }).withMessage('Name must be under 200 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ max: 5000 }).withMessage('Message must be under 5 000 characters.')
    .escape()
];

/* ---- Middleware to check validation results ---- */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
}

router.post('/', contactRules, validate, contactController.submit);
router.get('/',  contactController.getAll);   // admin / debug

module.exports = router;
