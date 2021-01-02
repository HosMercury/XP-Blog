let express = require('express');
let router = express.Router();
const pool = require('../config/db');
const { postsPerPage, maxDisplayPagesNumbers } = require('../settings');

// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

router.get('/setup', async (req, res) => {
  const q = `INSERT INTO posts (title, content, user_id ) VALUES ($1, $2,$3) returning *`;
  const v = [`Hello World`, `lorem ipsum vola content`, 1];
  await pool
    .query(q, v)
    .then(res => res.status(200).send(res.rows[0]))
    .catch(err => res.status(500).send('database err'));
});

const paginate = async (pageNumber, res) => {
  if (isNaN(pageNumber)) res.status(304).redirect('/?p=1');

  let totalPosts = 0;

  await pool
    .query(`SELECT COUNT(*) FROM posts`)
    .then(resp => {
      totalPosts = resp.rows[0].count;
    })
    .catch(err => res.status(500).send('database error'));

  const pagesCount = Math.ceil(totalPosts / postsPerPage);
  let offset = 0;

  if (pageNumber - 1 >= pagesCount)
    res.status(404).send('This page is not available');

  if (pageNumber > 1) offset += 1;
  const q = `SELECT * FROM posts ORDER BY id DESC LIMIT $1 OFFSET $2`;
  await pool
    .query(q, [postsPerPage, offset])
    .then(resp => {
      res.status(200).render('posts/list', {
        posts: resp.rows,
        pagesCount,
        postsPerPage,
        pageNumber,
        maxDisplayPagesNumbers,
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

  if (
    title.length > 4 &&
    title.length < 100 &&
    content.length > 10 &&
    content.length < 5000
  ) {
    let v = [];
    let q = '';
    let msg = '';

    if (id == '') {
      q =
        'INSERT INTO posts(title, content , user_id) values($1,$2, $3) RETURNING *';
      v = [title, content, 1];
      msg = 'added';
    } else if (!isNaN(id)) {
      q = 'UPDATE posts SET title = $1 , content =$2 WHERE id = $3 RETURNING *';
      v = [title, content, id];
      msg = 'updated';
    } else {
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

  res
    .status(404)
    .send(
      'Title length should be between 4 & 10 letters ,' +
        'while content length should be between 100 & 5000 letters'
    );
});

module.exports = router;
