// zuperior-dashboard/server/src/routes/user.routes.js

const express = require('express');
const { getUser } = require('../controllers/user.controller.js');

const router = express.Router();

// User routes
router.post('/get-user', getUser);

module.exports = router;