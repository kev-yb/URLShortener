require('dotenv').config();
const jwt = require('jsonwebtoken');
const Users = require('./models/users.js');
const ShortUrl = require('./models/shortUrl.js');


// authentication middleware
function authenticateToken(req, res, next){
  const token = req.cookies['token'];
  if(token == null){
    return res.sendStatus(401);
  }
  jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, user)=>{
    if(err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}




module.exports = authenticateToken