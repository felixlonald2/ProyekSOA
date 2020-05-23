const express = require('express'),
      app = express(),
      port = process.env.port || 3000,
      bodyParser = require('body-parser'),
      fetch = require('node-fetch');
      db = require('./database');

const request= require('request');

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    next();
  });

app.get('/',function(req, res){
    // res.render("negara/index");
    res.send("asd")
});

app.get('/api/portal/:kode',async function(req, res){
    const result = await fetch(`
    http://newsapi.org/v2/top-headlines?country=${req.params.kode}&apiKey=d6fb52f26bd34ab48dc3416445d12a1a
    `);

    const data= await result.json();
    const dataFilter = data.articles;

    res.render("home/index",{data:dataFilter,kode:req.params.kode});
});

app.get('/api/filter/:filter',async function(req, res){
    const result = await fetch(`
    http://newsapi.org/v2/top-headlines?category=${req.params.filter}&apiKey=d6fb52f26bd34ab48dc3416445d12a1a
    `);

    const data= await result.json();
    const dataFilter = data.articles;

    res.render("home/index",{data:dataFilter});
}); 

app.post('/api/search',async function(req, res){

    var key = req.body.key;
    var sort = req.body.sort;

    const result = await fetch(`
    https://newsapi.org/v2/everything?q=${key}&apiKey=d6fb52f26bd34ab48dc3416445d12a1a&sortBy=${sort}
    `);

    const data= await result.json();
    const dataFilter = data.articles;

    res.render("home/index",{data:dataFilter});
}); 

app.post('/api/detail',async function(req, res){
    
}); 

app.listen(3000||process.env.PORT);

