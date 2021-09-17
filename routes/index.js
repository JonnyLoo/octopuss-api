const express = require('express');
const ROUTER = express.Router();

const controller = require('../controllers');

ROUTER.get('/:id', controller.getOctopuss);
ROUTER.post('/generate', controller.generateOctopuss);

module.exports = ROUTER;
