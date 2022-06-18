var express = require('express');
var router = express.Router();

const passport = require('passport');
const authenticate = require('../authenticate')

const User= require('../models/user');

router.get('/', authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    User.find({}).then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
})
router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if(req.body.firstname && req.body.firstname.length){
        user.firstname=req.body.firstname;
      }
      if(req.body.lastname && req.body.lastname.length){
        user.lastname=req.body.lastname;
      }
      user.save((user) =>{
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Registration Successful!'});
          });
        },
        (err) => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
      )
    }
  });
});

router.post('/login', passport.authenticate('local',{session: false}), (req, res) => {
  var token= authenticate.getToken({_id:req.user._id})
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true,token:token, status: 'You are successfully logged in!'});
});

module.exports = router;
