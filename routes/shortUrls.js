require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Users = require('../models/users.js');
const ShortUrl = require('../models/shortUrl.js');
const authenticateToken = require('../auth.js')


router.route('/').
  // direct to user's list of short urls
  get(authenticateToken, async (req, res)=>{
  const shortUrls = await ShortUrl.find({username: req.user.username});
  res.render('homepage', {shortUrls: shortUrls});
}).
  // post a URL to be shortened
  post(authenticateToken, async (req, res)=>{
  await ShortUrl.create({username: req.user.username, full: req.body.url});
  res.redirect('/shortUrls');
});


// deletes selected URL
router.delete('/:short', authenticateToken, async (req, res)=>{
    await ShortUrl.deleteOne({username: req.user.username, short: req.params.short}, (err, result) => {
    if(err) { 
      console.log(err)
      res.sendStatus(400)
    }
    else {
      res.json({redirect: '/shortUrls'});
    }
  }).clone();
});



module.exports = router;