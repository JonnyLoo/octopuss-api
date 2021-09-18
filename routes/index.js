const express = require('express');
const ROUTER = express.Router();

const controller = require('../controllers');

ROUTER.get('/:dna', controller.getOctopuss);
ROUTER.post('/generate', controller.generateOctopuss);
ROUTER.post('/gimmie', controller.gimmie);

module.exports = ROUTER;
