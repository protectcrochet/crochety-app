const express = require('express');
const router = express.Router();
const patronController = require('../controllers/patronController');
const authMiddleware = require('../middleware/auth');
const { authOpcional } = require('../middleware/auth');

// Público (con auth opcional para preview)
router.get('/', authOpcional, patronController.listar);
router.get('/portada/:id', require('../handlers/portadaHandler'));
router.get('/archivo/:hash', require('../handlers/archivoHandler'));
router.get('/:id', authMiddleware, patronController.detalle);

// Protegido
router.post('/mi-lista', authMiddleware, patronController.toggleMiLista);

module.exports = router;