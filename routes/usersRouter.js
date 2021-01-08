let express = require('express');
let router = express.Router();
const pool = require('../config/db');
const { postsPerPage, maxDisplayPagesNumbers } = require('../settings');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post(
  '/login',
  body('email').isEmail().withMessage('Invalid email address example@mail.com'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be more than 6 chars'),
  async (req, res) => {
    // request validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.redirect('/users/login');

    // Get the user from db
    const q = `SELECT * FROM users WHERE email = $1`;
    const v = [req.body.email];
    const user = await pool
      .query(q, v)
      .then(r => r.rows[0])
      .catch(err => res.redirect('/users/login'));

    // compare password
    const hash = await bcrypt.hash(req.body.password, 8);
    const savedHash = user.hash;
    const sentPassword = req.body.password;
    const passwordMatched = await bcrypt.compare(sentPassword, savedHash);

    //Password matched and user exists
    //check cookie
    //check if the user has a token
    if (passwordMatched) {
      const qu = 'SELECT * FROM tokens WHERE user_id = $1';
      const vs = [user.id];
      const accessToken = await pool
        .query(qu, vs)
        .then(r => r.rows[0])
        .catch(er => console.log(er));

      // create the token
      const token = jwt.sign(
        { user: { email: user.email, name: user.user_name } },
        process.env.JWT_KEY
      );

      // check cookie

      console.log('req.cookies from login', req.cookies);
      try {
        if (!req.cookies) {
          console.log('seeting cookie');
          res.cookie('xpcookie', token, { maxAge: 360000000 });
        }
      } catch (e) {
        console.log('no cookies set', e);
      }

      try {
        if (!accessToken) {
          //if no access token
          //create and save token
          //insert the token to db
          const query =
            'INSERT INTO tokens( user_id , token ) VALUES ($1,$2) RETURNING *';
          const values = [user.id, token];
          const result = await pool
            .query(query, values)
            .then(r => r.rows[0])
            .catch(err => console.log(err));

          // may have access token but no cookie
          const xpcookie = req.cookies.xpcookie;
          if (xpcookie === undefined) {
            console.log('creating a cookie');
            // no: set a new cookie
            res
              .cookie('xpcookie', token, {
                maxAge: 36000000000,
                httpOnly: true,
              })
              .redirect('/');

            console.log('cookie created successfully');
          } else {
            // yes, cookie was already present
            console.log('cookie exists', xpcookie);
          }
        } else {
          res.redirect('/');
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      res.send('incorrect credentials');
    }
  }
);

router.post('/logout', (req, res) => {
  try {
    if (req.cookies.xpcookie) {
      res.cookie('xpcookie', { maxAge: 0 });
      res.redirect('/');
    }
  } catch (e) {
    console.log(e);
  }
});

router.get('/register', (req, res) => {
  res.render('/auth/register');
});

router.post(
  '/register',
  body('name')
    .isLength({ min: 4 })
    .trim()
    // .escape()
    .withMessage('Name should be more than 4'),
  body('email').isEmail().withMessage('Invalid email address example@mail.com'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be more than 6 chars'),
  body('password2')
    .isLength({ min: 6 })
    .withMessage('Password must be more than 6 chars')
    .custom((v, { req }) => v === req.body.password)
    .withMessage('passwords not matched'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).json({ errors: errors.array() });
    const user_name = req.body.name;
    const email = req.body.email;
    const hash = await bcrypt.hash(req.body.password, 8);

    const q = `INSERT INTO users(email,hash,user_name) VALUES($1,$2,$3) RETURNING *`;
    const v = [email, hash, user_name];

    const created = await pool
      .query(q, v)
      .then(resp => {
        res.redirect('login');
      })
      .catch(err => res.status('500').send('db error'));

    res.json(created);
  }
);

module.exports = router;
