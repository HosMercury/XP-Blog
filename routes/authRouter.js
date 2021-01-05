let express = require('express');
let router = express.Router();
const pool = require('../config/db');
const { postsPerPage, maxDisplayPagesNumbers } = require('../settings');
const { body, validationResult } = require('express-validator');
const crypt = require('bcryptjs');

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post(
  '/register',
  body('name')
    .isLength({ min: 4 })
    .trim()
    .escape()
    .withMessage('Name should be more than 4'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address example@mail.com'),
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
    const hash = await crypt.hash(req.body.password, 8);

    const q = `INSERT INTO users(email,hash,user_name) VALUES($1,$2,$3) RETURNING *`;
    const v = [email, hash, user_name];

    const created = await pool
      .query(q, v)
      .then(resp => {
        // need flas msg later
        res.redirect('login');
      })
      .catch(err => res.status('500').send('db error'));

    res.json(created);
  }
);

module.exports = router;
