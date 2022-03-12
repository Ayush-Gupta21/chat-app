const express=require('express');
const app=express();
const chattingserver=require('http').createServer(app);
const io=require('socket.io')(chattingserver,{cors:{origin:'*'}});
const chats=require('./model/chat');
const passport = require('passport');
require('./config/passport-local');
const User = require('./model/user');
const session = require('express-session');
const cookieparser=require('cookie-parser');
const chat_controller = require('./controller/chat_controller');


//Database Connection-------------------------
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/ChattingApp', 
{useNewUrlParser: true}).then(() => {
    console.log("DB connected!!");
})
//---------------------------------------------

app.use(session({
    name: 'ayush',
    secret: 'password',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2
    }
}))

app.use(cookieparser());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticationUser);

app.set('view engine','ejs');
app.set('views',__dirname+'/views');

app.use(express.static('./style'));
app.use(express.urlencoded({extended:true}));


io.on('connection',function(socket){
    console.log("token",socket.id);
    socket.on('message',(data)=>{
        var arr=data.split("-");
        chats.create({
            message:arr[0],
            sender:arr[1],
            senderId:arr[2]
        })
        socket.broadcast.emit('message',data);
        socket.emit('message',data);
    })
});

app.use("/", chat_controller);

chattingserver.listen(5000, () => {
    console.log("Good to go at port 5000!!!");
});