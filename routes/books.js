/**
 * Books routes
 */

'use strict';

const { Router }        = require('express');
const booksController   = require('../controllers/booksController');

const router = Router();

router.get('/',          booksController.getAll);
router.get('/featured',  booksController.getFeatured);
router.get('/slug/:slug', booksController.getBySlug);
router.get('/:id',       booksController.getOne);

module.exports = router;
