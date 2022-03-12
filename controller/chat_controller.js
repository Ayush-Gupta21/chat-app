const express=require('express');
const app=express();
const chats=require('../model/chat');
const passport = require('passport');
require('../config/passport-local');
const User = require('../model/user');

var error=null;

app.get('/', passport.checkAuthentication, function (req, res) {
    chats.find({},null,{sort:{createdOn:-1}},function(err,data){
        return res.render('chatting',{chatdata:data});
    })
})

app.get('/signin', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    error=null;
    return res.render('login_page',{error:error});
})

app.get('/signup', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.render('signup_page',{error:error});
})

app.get('/signout',function(req,res){
    req.logOut();
    error=null;
    return res.redirect('/signin');
})

app.post("/login", passport.authenticate('local', { failureRedirect: "/signin" }), function (req, res) {
    error=null;
    return res.redirect('/');
})

app.post('/createuser', function (req, res) {

    if (req.body.password !== req.body.confirm_password) {
        error="Passwords Not Matched !!";
        return res.redirect('back');
    }

    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
            return;
        }
        if (!user) {

            User.create(req.body, function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }
                else
                {
                    error=null;
                    console.log(data);
                    return res.redirect('/signin');
                }
            });
        }
        else {
            error="User Already Exists";
            return res.redirect('/signup');
        }
    })

})

app.get('/*',function(req,res){
    res.redirect('/signin');
})

module.exports=app;