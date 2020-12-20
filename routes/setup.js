const express = require('express');
var router = express.Router();
const pool = require('../config/db');

router.get('/setup', async (req, res) => {
  const q = `insert into posts (title, content, user_id ) values ($1, $2,$3) returning *`;
  const v = [`Hello World`, `lorem ipsum vola content`, 1];
  const results = await pool
    .query(q, v)
    .then(res => console.log(res.rows[0]))
    .catch(err => console.log(err));

  res.send(results);
});

module.exports = router;
