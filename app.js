require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
// Routes
var index = require('./routes/index');
var setup = require('./routes/setup');

app.use('/', index);
app.use('/', setup);

//View Engine
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
