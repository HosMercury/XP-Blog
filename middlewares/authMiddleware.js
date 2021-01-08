const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log(req.cookies.xpcookie);
    const token = req.cookies.xpcookie;
    const { user } = jwt.verify(token, process.env.JWT_KEY);
    res.locals.user = user;
  } catch (e) {
    console.log(e);
  }
  next();
};
