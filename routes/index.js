var express = require('express');
var router = express.Router();

// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

router.get('/', (req, res) => {
  res.render('../views/index');
});

module.exports = router;
