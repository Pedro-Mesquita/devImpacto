const express = require('express');
const router = express.Router();
const { getPrecoDinamico } = require('../controllers/precoDinamicoController');

// POST /preco-dinamico
// Body: { loteIds: ["1", "2", "3"] }
router.post('/getprecodinamico', getPrecoDinamico);

module.exports = router;