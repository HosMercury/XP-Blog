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
      posts = resp.rows[0];
    })
    .catch(err => res.status(200).send('database error'));

  const limit = 5;
  const pages = Math.ceil(posts.count / limit);
  let offset = 0;

  if (p > 1) offset += 5;

  const q = `SELECT * FROM posts ORDER BY id DESC LIMIT $1 OFFSET $2`;

  await pool
    .query(q, [limit, offset])
    .then(resp => {
      res.status(200).render('posts/list', {
        posts: resp.rows,
        pages,
        limit,
        p,
      });
    })
    .catch(err => res.send('pagination error'));
};

router.get(`/`, async (req, res) => {
  paginate(req.query.p, res);
});

const getPostById = async (id, res) => {
  let post = {};
  const q = `SELECT * FROM posts WHERE id = $1 `;
  return await pool
    .query(q, [id])
    .then(resp => resp.rows[0])
    .catch(err => res.status(404).send('error finding post'));
};

const queryPost = async (id, res, view = 'edit') => {
  if (isNaN(id)) res.status(404).send('id error');
  const post = await getPostById(id, res);
  res.render(`posts/${view}`, { post, view });
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
  const title = req.body.title.trim();
  const content = req.body.content.trim();
  const id = req.body.id;

  if (title.length > 4 && content.length > 10) {
    let v = [];
    let q = '';
    let msg = '';
    // console.log('id', id);

    if (id == '') {
      console.log('empty');
      q =
        'INSERT INTO posts(title, content , user_id) values($1,$2, $3) RETURNING *';
      v = [title, content, 1];
      msg = 'added';
    } else if (!isNaN(id)) {
      console.log('number');
      q = 'UPDATE posts SET title = $1 , content =$2 WHERE id = $3 RETURNING *';
      v = [title, content, id];
      msg = 'updated';
    } else {
      console.log('not');
      res.status(404).send('Form error');
    }

    await pool
      .query(q, v)
      .then(resp => {
        res.status(200).render('posts/view', {
          post: resp.rows[0],
          flash: { color: 'green', msg: `Your post successfully ${msg}` },
        });
      })
      .catch(err => res.status(404));
  }

  res.status(404).send('form error');
});

module.exports = router;

// Maximun title and content
// pagination
//auth
