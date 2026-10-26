const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/monetizationController');
const puntos = require('../controllers/puntosController');

router.post('/email', ctrl.capturarEmail);
router.post('/desbloqueo', ctrl.crearDesbloqueo);
router.get('/desbloqueo/:patronId', ctrl.verificarDesbloqueo);
router.get('/postback/cpx', ctrl.postbackCPX);
router.get('/click', ctrl.registrarClick);

// Puntos Crochety
router.get('/puntos', puntos.estado);
router.post('/puntos/ganar', puntos.ganar);

module.exports = router;
