const express = require('express');
const router = express.Router();
const { getPrecoDinamico } = require('../controllers/precoDinamicoController');

// GET /preco-dinamico/:loteId
router.get('/:loteId', getPrecoDinamico);

module.exports = router;