/**
 * Cart routes
 */

'use strict';

const { Router }       = require('express');
const cartController   = require('../controllers/cartController');

const router = Router();

router.get('/',          cartController.get);
router.post('/',         cartController.add);
router.patch('/:id',     cartController.update);
router.delete('/:id',    cartController.remove);
router.delete('/',       cartController.clear);
router.post('/checkout', cartController.checkout);

module.exports = router;
