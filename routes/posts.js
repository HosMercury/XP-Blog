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
    .then(res => res.status(200).send(res.rows[0]))
    .catch(err => res.status(500).send('database err'));
});

const paginate = async (p, res) => {
  if (isNaN(p)) res.status(304).redirect('/?p=1');

  let totalPosts = 0;

  await pool
    .query(`SELECT COUNT(*) FROM posts`)
    .then(resp => {
      totalPosts = resp.rows[0];
    })
    .catch(err => res.status(200).send('database error'));

  const rowsPerPage = 5;
  const pagesCount = Math.ceil(totalPosts.count / rowsPerPage);
  let limit = 0;

  if (p > 1) limit += 5;

  const q = `SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 , $2`;

  await pool
    .query(q, [limit, rowsPerPage])
    .then(resp => {
      console.log(resp.rows);
      res.status(200).render('posts/list', {
        posts: resp.rows,
      });
    })
    .catch(err => {
      //
    });
};

router.get(`/`, async (req, res) => {
  paginate(req.query.p, res);

  // await pool
  //   .query(q)
  //   .then(resp =>
  //     res.status(200).render(`posts/list`, {
  //       posts: resp.rows,
  //     })
  //   )
  //   .catch(err => res.status(500).send(`database error`));
});

queryPost = async (id, res, view = 'edit') => {
  if (isNaN(id)) res.status(500).send('url error');

  const q = ` SELECT * FROM posts WHERE id = $1`;

  await pool
    .query(q, [id])
    .then(resp => {
      res.render(`posts/${view}`, { post: resp.rows[0], view });
    })
    .catch(err => res.status(500).send('database error'));
};

router.get(`/add`, (req, res) => {
  res.status(200).render('posts/add', { post: {}, view: 'add' });
});

router.get('/:id', async (req, res) => {
  queryPost(req.params.id, res, 'view');
});

router.get(`/:id/edit`, (req, res) => {
  queryPost(req.params.id, res, 'edit');
});

router.get(`/view`, (req, res) => {
  res.status(200).render(`posts/view`);
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
        res.status(200).render('posts/view');
      })
      .catch(err => res.status(500).send('do not play with me'));
  }
});

module.exports = router;
