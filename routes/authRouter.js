let express = require('express');
let router = express.Router();
const pool = require('../config/db');
const { postsPerPage, maxDisplayPagesNumbers } = require('../settings');

router.get('/login', (req, res) => {
  res.render('auth/login');
});

module.exports = router;
