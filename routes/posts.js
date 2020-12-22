let express = require('express');
let router = express.Router();
const pool = require('../config/db');

// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

router.get('/setup', async (req, res) => {
  const q = `INSERT INTO posts (title, content, user_id ) VALUES ($1, $2,$3) returning *`;
  const v = [`Hello World`, `lorem ipsum vola content`, 1];
  const results = await pool
    .query(q, v)
    .then(res => console.log(res.rows[0]))
    .catch(err => console.log(err));

  res.send(results);
});

router.get(`/`, async (req, res) => {
  const query = `SELECT * FROM posts ORDER BY created_at DESC`;

  await pool
    .query(query)
    .then(resp =>
      res.render(`posts/index`, {
        posts: resp.rows,
      })
    )
    .catch(err => res.send(`database error`));
});

router.get(`/add`, (req, res) => {
  res.render(`posts/add`, {});
});

router.get(`/view`, (req, res) => {
  res.render(`posts/view`, {});
});

router.post(`/`, async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  if (title.length > 4 && content.length > 4) {
    q = 'INSERT INTO posts(title, content , user_id) values($1,$2, $3)';
    v = [title, content, 1];
    await pool
      .query(q, v)
      .then(resp => {
        res.send('ok');
      })
      .catch(err => res.send('do not play with me'));
  }
});

module.exports = router;