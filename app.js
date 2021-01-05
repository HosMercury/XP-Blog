require('dotenv').config();
const express = require('express');
const redis = require('redis');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const client = redis.createClient();
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('morgan');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('morgan')('dev'));
app.use(express.static(__dirname + '/public'));

//session
app.use(
  session({
    secret: process.env.SESSION_KEY,
    // create new redis store.
    store: new redisStore({
      host: 'localhost',
      port: 6379,
      client: client,
      ttl: 260,
    }),
    saveUninitialized: false,
    resave: false,
  })
);

// Routes
var postsRouter = require('./routes/postsRouter');
var authRouter = require('./routes/authRouter');

app.use('/posts', postsRouter);
app.use('/', authRouter);
app.get('/', (req, res) => res.status(304).redirect('/posts?p=1'));

// app.get('/', (req, res) => req.render('posts/list'));

//View Engine
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
