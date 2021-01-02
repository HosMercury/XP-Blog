require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

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
