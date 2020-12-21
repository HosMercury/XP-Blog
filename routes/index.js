var express = require('express');
var router = express.Router();
const pool = require('../config/db');

// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

router.get('/setup', async (req, res) => {
  const q = `insert into posts (title, content, user_id ) values ($1, $2,$3) returning *`;
  const v = [`Hello World`, `lorem ipsum vola content`, 1];
  const results = await pool
    .query(q, v)
    .then(res => console.log(res.rows[0]))
    .catch(err => console.log(err));

  res.send(results);
});

router.get(`/`, async (req, res) => {
  const query = `SELECT * FROM posts`;

  await pool
    .query(query)
    .then(resp =>
      res.render(`../views/index`, {
        posts: resp.rows,
      })
    )
    .catch(err => res.send(`database error`));
});

router.get(`/add`, (req, res) => {
  res.render(`add-post`, {});
});

router.post(`/`, (req, res) => {
  console.log(req.body);
});

module.exports = router;
