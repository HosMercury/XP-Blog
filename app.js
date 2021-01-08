require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewares/authMiddleware');

app.use(cookieParser());
app.use(authMiddleware);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Routes
var postsRouter = require('./routes/postsRouter');
var usersRouter = require('./routes/usersRouter');

app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.get('/', (req, res) => res.status(304).redirect('/posts?p=1'));

// app.get('/', (req, res) => req.render('posts/list'));

//View Engine
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
