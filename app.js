const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      port = process.env.port || 3000,
      fetch = require('node-fetch'),
      db = require('./database');
const request= require('request');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51GuFJmKXe5VFGA8ZdHbRBGZZiVUlrDnoR0KtdIghwqet0v0M0ZtY9aoWx92nJuAaM7YOhgNMmpcNAguxWOEDvFG9004xuhVpZb')
const exphbs = require('express-handlebars')

app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set("view engine","handlebars");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use("/api/users",require("./routes/users"))
app.use("/api/news",require("./routes/news"))
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,"./public/uploads");
    },
    filename : function(req,file,callback){
        const filename = file.originalname.split(".");
        const extension = filename[1];
        callback(null,Date.now()+"."+extension);
    }
});
const uploads = multer({
    storage: storage
});
app.get("/",async function(req,res){
    res.render("index");
});
app.listen(process.env.PORT,function(){
    console.log("Listening to port "+process.env.PORT);
});