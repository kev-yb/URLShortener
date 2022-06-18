require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Users = require('./models/users.js');
const ShortUrl = require('./models/shortUrl.js');
const homepageRouter = require('./routes/shortUrls.js');
const authenticateToken = require('./auth.js')



mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true, useUnifiedTopology: true
})
  .then(()=>{
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));



app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());


// direct to homepage
app.get('/', (req, res)=>{
  res.render('login');
});


// posts new user credentials to mongodb
app.post('/sign-up', async (req, res)=>{
  const username = req.body.username;
  const password = req.body.password;
  const userInfo = await Users.find({username: username});
  if(userInfo.length !=0){
    return res.sendStatus(400);
  } 
  else{
    await Users.create({username: username, password: password});
    return res.redirect('/');
  }
});


// posts login credentials to mongodb
app.post('/login', async (req, res)=>{
  const userInfo = await Users.find(
    {username: req.body.username, password: req.body.password});
  if(userInfo.length ==0) {
    return res.sendStatus(401);
  }
  else{
    const user = {
      username: userInfo[0].username,
      password: userInfo[0].password
    };
    const accessToken = jwt.sign(user, `${process.env.ACCESS_TOKEN_SECRET}`);
    res.cookie('token', accessToken);
    res.redirect('/shortUrls');
  }
});


// router for handling GET, POST, DELETE methods at /shortUrls
app.use('/shortUrls', homepageRouter);


// redirect to compressed URL
app.get('/:shortUrl', authenticateToken, async (req, res)=>{
  const shortUrl = await ShortUrl.findOne({short: req.params.shortUrl});
  if(shortUrl == null) return res.sendStatus(404);
  shortUrl.visited++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});


// logout user
app.post('/logout', authenticateToken, (req, res)=>{
  res.clearCookie('token');
  res.redirect('/');
});



